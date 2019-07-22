import DS from 'ember-data';
import { computed } from '@ember/object';
let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  startedAt: attr('date'),
  agendaItems: hasMany('oc-agendaitem'),

});
