const Telegraf = require('telegraf');
const moment = require('moment');
const { CLUBS, getCourtsAvailability } = require('./sport-life-squash');
const { serializeDate } = require('./validationUtils');

const { Extra } = Telegraf;

const BOT_TOKEN = '423197745:AAGrIXXPMJgyiFx8ClFsMmBLPP9oi3h4Qcc';

// Dancing with drum for heroku
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://gentle-falls-94867.herokuapp.com';

const bot = new Telegraf(BOT_TOKEN);
bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`);
bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);

function setAppState(newState) {
  const existingState = bot.context.state || {};
  bot.context.state = {
    ...existingState,
    ...newState
  };
}

bot.hears('hi', ctx => ctx.reply('Hey!'));

function getMessageDate(msgDate) {
  if (!msgDate) {
    return moment();
  }
  return serializeDate(msgDate);
}

function serializeClubName(clubName) {
  return CLUBS.KIEV.find(club => club.name.toLowerCase() === clubName.toLowerCase());
}

bot.command('help', (ctx) => {
  ctx.reply(`
To check courts availability type '/courts day club'

Where "day" and "club" are optional arguments.
day" - day name on nearest week. In one of the format: "mo", "mon", "monday". If you don't specify this parameter it will set to today.
"club" - sportlife club name. Just omit this parameter for the first time to check the abailable club names
  `);
});

bot.command('courts', (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const date = getMessageDate(args[0]);

  if (!date) {
    const validFormats = `\n${moment.weekdaysMin().join(', ')} \n${moment.weekdaysShort().join(', ')} \n${moment.weekdays().join(', ')}`;
    return ctx.reply(`Invalid date. Please specify week day in one of the following formats: ${validFormats}`);
  }

  const clubName = args[1];
  if (!clubName) {
    setAppState({ date });

    return ctx.reply(
      'Choose a Sport-Life court',
      Extra.HTML().markup(m =>
        m.inlineKeyboard(CLUBS.KIEV.map(club => [m.callbackButton(club.name, club.name)])))
    );
  }
  const club = serializeClubName(clubName);

  if (!club) {
    return ctx.reply(`Invalid club name. Valid values are: ${CLUBS.KIEV.map(c => c.name).join(', ')}`);
  }

  return getCourtsAvailability(date, club.id).then(result => ctx.reply(result));
});

bot.action(/.+/, (btnCtx) => {
  const clubId = CLUBS.KIEV.find(club => club.name === btnCtx.match[0]).id;
  return getCourtsAvailability(btnCtx.state.date, clubId).then(result => btnCtx.reply(result));
});

bot.startPolling();
