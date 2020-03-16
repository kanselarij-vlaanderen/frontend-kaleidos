import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  number: attr('string'),
  shortTitle: attr('string'),
  numberOfWorks: attr('number'),
  digital: attr('boolean'),
  finalPublicationDate: attr('date'),
  type: attr('string'),
  NUMAC: attr('number'),
  mandatee: belongsTo('mandatee'),
  state: belongsTo('publication-state'),
  requestedBy: belongsTo('person'),
  documentVersion: belongsTo('document-version'),
  remarks: hasMany('remark'),
  decisions: hasMany('decision')
});
