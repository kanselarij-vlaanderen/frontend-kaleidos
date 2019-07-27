import DS from 'ember-data';
import { computed } from '@ember/object';
let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  identifier: attr('string'),
  agendaItems: hasMany('oc-agendaitem'),
});
