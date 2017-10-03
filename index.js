const Telegraf = require('telegraf');
const { CLUBS, getCourtsAvailability } = require('./sport-life-squash');
const { Markup, Extra } = Telegraf;

const BOT_TOKEN = '423197745:AAGrIXXPMJgyiFx8ClFsMmBLPP9oi3h4Qcc';
const app = new Telegraf(BOT_TOKEN);

app.hears('hi', ctx => {
  return ctx.reply('Hey!');
});

app.hears('courts', ctx => {
  return ctx.reply(
    'Choose a Sport-Life court',
    Extra.HTML().markup(
      (m) => m.inlineKeyboard(CLUBS.KIEV.map((club) => [m.callbackButton(club.name, club.name)]))
    )
  );
});

app.action(/.+/, ctx => {
  const clubId = CLUBS.KIEV.find(club => club.name === ctx.match[0]).id;
  return getCourtsAvailability(undefined, clubId)
    .then((result) => ctx.reply(result));
});

app.startPolling();