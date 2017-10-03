const axios = require('axios');
const moment = require('moment');
const { JSDOM } = require('jsdom');
const { DATE_FORMAT } = require('./constants');

const CITY_IDS = {
  KIEV: 80
};

const CLUBS = {
  KIEV: [
    { name: 'Protasov Yar', id: 30 },
    { name: 'Poznyaki', id: 29 },
    { name: 'Kurenyovka', id: 13 },
    { name: 'Mayakovskogo', id: 21 },
    { name: 'Teremki', id: 32 },
  ]
};

function generateUrl(date, clubId, cityId) {
  const SPORT_LIFE_TABLE_URL = 'http://squasharena.com.ua/get-courts-data-table.php';
  return `${SPORT_LIFE_TABLE_URL}?city_id=${cityId}&club_id=${clubId}&date_selected=${date}`;
}

function getCourtsAvailability(date = moment().add(1, 'days').format(DATE_FORMAT), clubId = CLUBS.KIEV[0].id, cityId = CITY_IDS.KIEV) {
  return axios.get(generateUrl(date, clubId, cityId)).then(res => convertHtmlResponse(res.data));
}

const PHONE_NUMBER_REGEX = /\d{3}[- ]?\d{3}-\d{2}-\d{2}/g;

function convertHtmlResponse(innerHtml) {
  const { document } = new JSDOM(`<!DOCTYPE html><table>${innerHtml}</table>`).window;

  const freeCourtCell = document.querySelector(`.${FREE_CELL_CLASS}`);

  if (!freeCourtCell) {
    return 'Нет свободных кортов на этот день';
  }

  const phoneNumbers = freeCourtCell.title.match(PHONE_NUMBER_REGEX);
  let message = `Номера для брони: ${phoneNumbers.join(', ')} \n`;

  const availabilityMap = getTableAvailabilityMap(document.querySelector('table'));
  return `${message} ${printAvailabilityTable(availabilityMap)}`;
}

const FIRST_AVAILABLE_HOUR = 7;
const EMPTY_CELL_CLASS = 'courts-table__empty';
const FREE_CELL_CLASS = 'courts-table__free';
const OCCUPIED_CELL_CLASS = 'courts-table__occupied';

function getTableAvailabilityMap(table) {
  const availabilityMap = {};
  const trs = table.querySelectorAll('tr');  
  trs.forEach(tr => {
    tr.querySelectorAll(`.${FREE_CELL_CLASS},.${OCCUPIED_CELL_CLASS}`).forEach((td, index) => {
      const hour = FIRST_AVAILABLE_HOUR + index;
      const hourAvailability = availabilityMap[hour] || 0;

      if (td.classList.contains(FREE_CELL_CLASS)) {
        availabilityMap[hour] = hourAvailability + 1;
      }
    });
  });
  return availabilityMap;
}

function printAvailabilityTable(availabilityMap) {
  return Object.keys(availabilityMap).reduce((result, hour) => {
    const stringHour = +hour < 10 ? `0${hour}:00` : `${hour}:00`;
    return `${result} \n ${stringHour} - ${availabilityMap[hour]} available`;
  }, '')
}

module.exports.CLUBS = CLUBS;
module.exports.getCourtsAvailability = getCourtsAvailability;
