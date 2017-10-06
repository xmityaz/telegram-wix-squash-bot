const moment = require('moment');

function serializeDate(dateArgument) {
  const result = moment();
  const isValidWeekDay = moment
    .weekdaysMin()
    .find(weekDay => weekDay.toLowerCase() === dateArgument.toLowerCase());

  if (isValidWeekDay) {
    const weekDayDate = moment().day(dateArgument);
    return result > weekDayDate ? weekDayDate.add(7, 'days') : result;
  }

  return null;
}

module.exports.serializeDate = serializeDate;
