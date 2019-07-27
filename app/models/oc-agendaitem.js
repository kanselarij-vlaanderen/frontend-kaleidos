import DS from 'ember-data';
import { computed } from '@ember/object';
let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  priority: attr('number'),
  subPriority: attr('string'),
  subject: attr('string'),
  distributionDate: attr('date'),

  meeting: belongsTo('oc-meeting', { inverse: null }),
  case: belongsTo('oc-case', { inverse: null }),

  submitters: hasMany('government-body'),
  meetingRecord: belongsTo('file'),
  notification: belongsTo('file'),

  documents: hasMany('file')
});
