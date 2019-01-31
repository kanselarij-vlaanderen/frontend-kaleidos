import DS from 'ember-data';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
	priority: attr('number'),
	orderAdded: attr('number'),
	extended: attr('boolean'),
	dateAdded: attr('date'),
  record: attr('string'),
  formallyOk: attr('boolean'),
  forPress: attr('boolean'),
	agenda: belongsTo('agenda'),
	comments: hasMany('comment'),
	subcase: belongsTo('subcase'),
  decision: belongsTo('decision'),
  newsItem: belongsTo('news-item'),
  postPonedToSession: belongsTo('session')


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
