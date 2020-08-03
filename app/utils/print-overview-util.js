import moment from 'moment';

/**
 * Construct the printoverview title
 *
 * @param translatedTitle
 * @param date
 */
export const getPrintOverviewTitle = (translatedTitle, date) => `${translatedTitle} ${moment(date).format('dddd DD-MM-YYYY')}`;
