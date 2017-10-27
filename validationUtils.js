const moment = require('moment');

function getValidDayFormats() {
  return [...moment.weekdaysMin(), ...moment.weekdaysShort(), ...moment.weekdays()];
}

function isValidDay(date) {
  return getValidDayFormats().find(weekDay => weekDay.toLowerCase() === date.toLowerCase());
}

function serializeDate(date) {
  const result = moment();
  const isValidWeekDay = isValidDay(date);

  if (isValidWeekDay) {
    const weekDayDate = moment().day(date);
    return result > weekDayDate ? weekDayDate.add(7, 'days') : result;
  }

  return null;
}

module.exports.serializeDate = serializeDate;
