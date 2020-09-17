import DS from 'ember-data';

const {
  Model, attr, hasMany, belongsTo,
} = DS;

export default Model.extend({
  date: attr('datetime'),
  text: attr('string'),
  result: belongsTo('consulation-response-code'),
  consulationRequest: belongsTo('consulation-request'),
  remarks: hasMany('remark'),
  documentContainers: hasMany('document-container'),
});
