import DS from 'ember-data';

let { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  title: attr('string'),
  subtitle: attr('string'),
  content: attr('string'),
  publicationDate: attr('datetime'),
  themes: hasMany('theme'),
  agendaItem: belongsTo('agendaitem')
});
