import { belongsTo, hasMany, attr } from '@ember-data/model';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';

export default class NewsletterInfo extends ModelWithModifier {
  @attr text;
  @attr subtitle;
  @attr title;
  @attr richtext;
  @attr mandateeProposal;
  @attr('boolean') finished;
  @attr('boolean') inNewsletter;
  @attr remark;

  get modelName() {
    return this.constructor.modelName;
  }

  @belongsTo('agenda-item-treatment') agendaItemTreatment;

  @hasMany('piece', {
    inverse: null,
  }) pieces;
  @hasMany('themes', {
    inverse: null,
  }) themes;
}
