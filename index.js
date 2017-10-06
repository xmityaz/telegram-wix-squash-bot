const Telegraf = require('telegraf');
const moment = require('moment');
const { CLUBS, getCourtsAvailability } = require('./sport-life-squash');
const { serializeDate } = require('./validationUtils');

const { Extra } = Telegraf;

const BOT_TOKEN = '423197745:AAGrIXXPMJgyiFx8ClFsMmBLPP9oi3h4Qcc';
const app = new Telegraf(BOT_TOKEN);

app.hears('hi', ctx => ctx.reply('Hey!'));

function getMessageDate(msgDate) {
  if (!msgDate) {
    return moment();
  }
  return serializeDate(msgDate);
}

function serializeClubName(clubName) {
  return CLUBS.KIEV.find(club => club.name.toLowerCase() === clubName.toLowerCase());
}

app.command('courts', (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const date = getMessageDate(args[0]);

  if (!date) {
    return ctx.reply(`Invalid date. Please specify week day in 2 letters format (${moment.weekdaysMin().join(', ')})`);
  }

  const clubName = args[1];
  if (!clubName) {
    app.action(/.+/, () => {
      const clubId = CLUBS.KIEV.find(club => club.name === ctx.match[0]).id;
      return getCourtsAvailability(date, clubId).then(result => ctx.reply(result));
    });

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

app.startPolling();
