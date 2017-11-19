const moment = require('moment');

function getValidDayFormats() {
  return [...moment.weekdaysMin(), ...moment.weekdaysShort(), ...moment.weekdays()];
}

function isValidDay(date) {
  return getValidDayFormats().some(weekDay => weekDay.toLowerCase() === date.toLowerCase());
}

function serializeDate(date) {
  const today = moment();
  const isValidWeekDay = isValidDay(date);

  if (isValidWeekDay) {
    const weekDayDate = moment().day(date);
    return today > weekDayDate ? weekDayDate.add(7, 'days') : weekDayDate;
  }

  return null;
}

module.exports.serializeDate = serializeDate;
