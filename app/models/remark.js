import DS from 'ember-data';

const {
  Model, attr, belongsTo, hasMany,
} = DS;

export default Model.extend({
  text: attr('string'),
  created: attr('datetime'),

  author: belongsTo('user'),
  agendaitem: belongsTo('agendaitem'),

  answers: hasMany('remark', {
    polymorphic: true,
  }),
});
