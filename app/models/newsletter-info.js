import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;
import { alias } from '@ember/object/computed';

export default Model.extend({
  modelName: alias('constructor.modelName'),

  text: attr('string'),
  subtitle: attr('string'),
  title: attr('string'),
  richtext: attr('string'),
  mandateeProposal: attr('string'),
  finished: attr('boolean'),
  publicationDate: attr('date'),
  publicationDocDate: attr('date'),
  remark: attr('string'),

  subcase: belongsTo('subcase'),
  meeting: belongsTo('meeting', { inverse: null }),
  documentVersions: hasMany('document-version', { inverse: null }),
});
