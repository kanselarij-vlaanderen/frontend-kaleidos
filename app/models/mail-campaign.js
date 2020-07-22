import DS from 'ember-data';
import { computed } from '@ember/object';

const {
  Model, attr, hasMany,
} = DS;

export default Model.extend({
  campaignId: attr('string'),
  campaignWebId: attr('string'),
  archiveUrl: attr('string'),
  sentAt: attr('datetime'),

  meetings: hasMany('meeting', {
    inverse: null,
  }),

  isSent: computed('sentAt', function() {
    const {
      sentAt,
    } = this;
    return !!sentAt;
  }),
});
