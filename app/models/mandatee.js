import DS from 'ember-data';
import { computed } from '@ember/object';
const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  title: attr('string'),
  nickName: attr('string'),
  priority: attr('number'),
  start: attr('date'),
  end: attr('date'),
  dateSwornIn: attr('date'),
  dateDecree: attr('date'),

  holds: belongsTo('mandate', { inverse: null }),
  person: belongsTo('person'),

  iseCodes: hasMany('ise-code', { inverse: null }),
  decisions: hasMany('decision'),
  cases: hasMany('case'),
  meetingsAttended: hasMany('meeting-record'),
  approvals: hasMany('approval'),
  subcases: hasMany('subcase', { inverse: null }),
  requestedSubcases: hasMany('subcase', { inverse: null }),
  agendaitems: hasMany('agendaitem', { inverse: null }),

  fullDisplayName: computed('person', 'title', 'person.nameToDisplay', function() {
    if (this.get('person.nameToDisplay')) {
      return `${this.get('person.nameToDisplay')}, ${this.get('title')}`;
    } else {
      return `${this.get('title')}`;
    }
  })
});
