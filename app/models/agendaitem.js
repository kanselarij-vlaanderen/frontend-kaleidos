import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  priority: attr('number'),
  created: attr('date'),
  record: attr('string'),
  formallyOk: attr('boolean'),
  titlePress: attr('string'),
  retracted: attr('boolean'),
  textPress: attr('string'),

  postponedTo: belongsTo('postponed'),
  agenda: belongsTo('agenda'),
  decision: belongsTo('decision'),
	subcase: belongsTo('subcase', {inverse:null}),
  remarks: hasMany('remark'),
  attendees: hasMany('mandatee'),
  newsletterInfo: belongsTo('newsletter-info'),

  isPostponed: computed('retracted', 'postponedTo', function(){
    return this.get('postponedTo').then((session) => {
      return session || this.get('retracted');
    });
  })
});
