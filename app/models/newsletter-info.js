import { belongsTo, hasMany, attr } from '@ember-data/model';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';

// TODO: octane refactor
export default ModelWithModifier.extend({
  modelName: alias('constructor.modelName'),
  intl: inject(),
  text: attr('string'),
  subtitle: attr('string'),
  title: attr('string'),
  richtext: attr('string'),
  mandateeProposal: attr('string'),
  finished: attr('boolean'),
  inNewsletter: attr('boolean'),
  remark: attr('string'),

  agendaItemTreatment: belongsTo('agenda-item-treatment'),
  pieces: hasMany('piece', {
    inverse: null,
  }),
  themes: hasMany('themes', {
    inverse: null,
  }),
});
