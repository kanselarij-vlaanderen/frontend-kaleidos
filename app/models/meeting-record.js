import DS from 'ember-data';
import { computed } from '@ember/object';

const {
  Model, attr, hasMany, belongsTo, PromiseArray,
} = DS;

export default Model.extend({
  created: attr('datetime'),
  modified: attr('datetime'),
  announcements: attr('string'),
  others: attr('string'),
  richtext: attr('string'),

  attendees: hasMany('mandatee'),
  signedDocument: belongsTo('document'),
  agendaitem: belongsTo('agendaitem'),
  meeting: belongsTo('meeting'),
  documentVersions: hasMany('document-version', {
    inverse: null,
  }),

  sortedAttendees: computed('attendees.@each', function() {
    return PromiseArray.create({
      promise: this.get('attendees').then((attendees) => attendees.sortBy('priority')),
    });
  }),
});
