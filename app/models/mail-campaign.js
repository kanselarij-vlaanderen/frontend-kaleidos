import DS from 'ember-data';
const { Model, attr, hasMany } = DS;
import { computed } from '@ember/object';

export default Model.extend({
	campaignId:attr('string'),
	campaignWebId:attr('string'),
	archiveUrl:attr('string'),
  sentAt: attr('datetime'),

	meetings:hasMany('meeting', {inverse:null}),

  isSent: computed('sentAt', function() {
    const { sentAt } = this;
    return !!sentAt;
  })
});
