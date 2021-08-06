import DS from 'ember-data';
import moment from 'moment';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default DS.DateTransform.extend({
  serialize(date) {
    if (date instanceof Date && !isNaN(date)) {
      return moment(date).format('YYYY-MM-DD');
    } if (moment.isMoment(date)) {
      return date.format('YYYY-MM-DD');
    }
    return null;
  },
});
