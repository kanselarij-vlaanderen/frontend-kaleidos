import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  function: attr('string'),
  isActive: attr('boolean'),

  file: belongsTo('file'),
  person: belongsTo('person'),
  meetings: hasMany('meeting', {
    inverse: null,
  }),
});
