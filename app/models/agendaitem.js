import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;


export default Model.extend({
  priority: attr('number'),
  created: attr('date'),
  postponed: attr('boolean'),
  record: attr('string'),
  formallyOk: attr('boolean'),
  titlePress: attr('string'),
  retracted: attr('boolean'),

  // postponedTo: belongsTo('meeting'),
  agenda: belongsTo('agenda'),
  decision: belongsTo('decision', {inverse:null}),
	subcase: belongsTo('subcase', {inverse:null}),
  remarks: hasMany('remark'),
  attendees: hasMany('mandatee'),

  // newsItem: belongsTo('news-item'),

  isPostponed: computed('postponed', 'postponedToSession', function(){
    return this.get('postponedToSession').then((session) => {
      return session || this.get('postponed');
    });
  })
  // Karel fix your shit :p
  // save: async function(){
  //   let news = await this.get('newsItem');
  //   if(news) {
  //     news = await news.save();
  //     this.set('newsItem', news);
  //   }
  //   let decision = await this.get('decision');
  //   if(decision) {
  //     decision = await decision.save();
  //     this.set('decision', decision);
  //   }
  //   return this._super(...arguments);
  // }
});
