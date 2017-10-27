const axios = require('axios');
const moment = require('moment');
const { JSDOM } = require('jsdom');
const { DATE_FORMAT } = require('./constants');

const CITY_IDS = {
  KIEV: 80
};

const CLUBS = {
  KIEV: [
    { name: 'Protasov', id: 30 },
    { name: 'Poznyaki', id: 29 },
    { name: 'Kurenyovka', id: 13 },
    { name: 'Mayakovskogo', id: 21 },
    { name: 'Teremki', id: 32 }
  ]
};

function getClubById(clubId) {
  const resClubs = Object.values(CLUBS).find(clubs => clubs.find(club => club.id === clubId));
  return resClubs.find(club => club.id === clubId);
}

function generateUrl(date, clubId, cityId) {
  const SPORT_LIFE_TABLE_URL = 'http://squasharena.com.ua/get-courts-data-table.php';
  return `${SPORT_LIFE_TABLE_URL}?city_id=${cityId}&club_id=${clubId}&date_selected=${date}`;
}

const PHONE_NUMBER_REGEX = /\d{3}[- ]?\d{3}-\d{2}-\d{2}/g;

const FIRST_AVAILABLE_HOUR = 7;
const FREE_CELL_CLASS = 'courts-table__free';
const OCCUPIED_CELL_CLASS = 'courts-table__occupied';

function getTableAvailabilityMap(table) {
  const availabilityMap = {};
  const trs = table.querySelectorAll('tr');  
  trs.forEach((tr) => {
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
  }, '');
}

function convertHtmlResponse(innerHtml, date, courtName) {
  const { document } = new JSDOM(`<!DOCTYPE html><table>${innerHtml}</table>`).window;

  const freeCourtCell = document.querySelector(`.${FREE_CELL_CLASS}`);

  if (!freeCourtCell) {
    return 'No available courst for this day';
  }

  const phoneNumbers = freeCourtCell.title.match(PHONE_NUMBER_REGEX);
  const phoneText = `${phoneNumbers.join(', ')}`;
  const dateText = `Available courts on ${date.format('MMM Do, dd')} in ${courtName}:`;

  const availabilityMap = getTableAvailabilityMap(document.querySelector('table'));
  return `
    ${dateText}
    ${printAvailabilityTable(availabilityMap)}
    ${phoneText}`;
}

function getCourtsAvailability(date = moment().add(1, 'days'), clubId = CLUBS.KIEV[0].id, cityId = CITY_IDS.KIEV) {
  const club = getClubById(clubId);
  return axios.get(generateUrl(date.format(DATE_FORMAT), clubId, cityId))
    .then(res => convertHtmlResponse(res.data, date, club.name));
}

module.exports.CLUBS = CLUBS;
module.exports.getCourtsAvailability = getCourtsAvailability;
