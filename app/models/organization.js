import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  site: belongsTo('site'),
  contactpoints: hasMany('contact-point'),
  posts: hasMany('post')
});
