import DS from 'ember-data';
import { computed } from '@ember/object';

const {
  Model, attr, hasMany, belongsTo,
} = DS;

export default Model.extend({
  title: attr('string'),
  nickName: attr('string'),
  priority: attr('number'),
  start: attr('datetime'),
  end: attr('datetime'),
  dateSwornIn: attr('datetime'),
  dateDecree: attr('datetime'),

  holds: belongsTo('mandate', {
    inverse: null,
  }),
  person: belongsTo('person'),

  iseCodes: hasMany('ise-code', {
    inverse: null,
  }),

  meetingsAttended: hasMany('meeting-record'),
  approvals: hasMany('approval'),
  subcases: hasMany('subcase', {
    inverse: null,
  }),
  requestedSubcases: hasMany('subcase', {
    inverse: null,
  }),
  agendaitems: hasMany('agendaitem', {
    inverse: null,
  }),

  fullDisplayName: computed('person', 'title', 'person.nameToDisplay', function() {
    const nameToDisplay = this.get('person.nameToDisplay');
    if (nameToDisplay) {
      return `${nameToDisplay}, ${this.get('title')}`;
    }
    return `${this.get('title')}`;
  }),
});
