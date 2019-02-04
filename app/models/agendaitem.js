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
  postPonedToSession: belongsTo('session'),

  save: async function(){
    let args  = arguments;
    let oldSave = this._super;
    let news = await this.get('newsItem');
    if(news){
      await news.save();
    }
    let decision = await this.get('decision');
    if(decision){
      await decision.save();
    }
    return await oldSave.call(this,...args);
  }
});
