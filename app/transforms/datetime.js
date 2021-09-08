// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import moment from 'moment';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default DS.DateTransform.extend({
  serialize(date) {
    if (moment.isMoment(date)) {
      return date.format();
    }
    return this._super(...arguments);
  },
});
