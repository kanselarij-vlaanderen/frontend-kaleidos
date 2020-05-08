import DS from 'ember-data';
import moment from 'moment';

export default DS.DateTransform.extend({
  serialize(date) {
    if (moment.isMoment(date)) {
      return date.format();
    } else {
      return this._super(...arguments);
    }
  }
});
