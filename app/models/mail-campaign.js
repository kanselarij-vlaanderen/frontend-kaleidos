import Model, { hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
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
