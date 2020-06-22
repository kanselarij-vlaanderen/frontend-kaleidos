import moment from 'moment';

/**
 * Construct the printoverview title
 *
 * @param translatedTitle
 * @param date
 */
export const getPrintOverviewTitle = (translatedTitle,date) => {
  return `${translatedTitle} ${moment(date).format('dddd DD-MM-YYYY')}`;
};
