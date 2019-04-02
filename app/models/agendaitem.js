import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  priority: attr('number'),
  created: attr('date'),
  record: attr('string'),
  // showAsRemark: attr('boolean'),
  retracted: attr('boolean'),

  titlePress: attr('string'),
  textPress: attr('string'),
  forPress: attr('boolean'),

  postponedTo: belongsTo('postponed'),
  agenda: belongsTo('agenda', { inverse: null }),
  decision: belongsTo('decision'),
  subcase: belongsTo('subcase', { inverse: null }),
  remarks: hasMany('remark'),
  attendees: hasMany('mandatee', { inverse: null }),
  newsletterInfo: belongsTo('newsletter-info', { inverse: null }),
  meetingRecord: belongsTo('meeting-record'),

  isPostponed: computed('retracted', 'postponedTo', function () {
    return this.get('postponedTo').then((session) => {
      return session || this.get('retracted');
    });
  })
});
