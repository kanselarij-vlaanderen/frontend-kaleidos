import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;


export default Model.extend({
	priority: attr('number'),
	orderAdded: attr('number'),
	postponed: attr('boolean'),
	dateAdded: attr('date'),
  record: attr('string'),
  formallyOk: attr('boolean'),
  forPress: attr('boolean'),
	agenda: belongsTo('agenda'),
	comments: hasMany('comment'),
	subcase: belongsTo('subcase', {inverse:null}),
  decision: belongsTo('decision', {inverse:null}),
  newsItem: belongsTo('news-item'),
  postponedToSession: belongsTo('session'),
  pressAgenda: attr('string'),

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
