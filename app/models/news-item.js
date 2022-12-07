import { hasMany, attr } from '@ember-data/model';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';

export default class NewsItem extends ModelWithModifier {
  @attr title;
  @attr subtitle;
  @attr htmlContent;
  @attr plainText;
  @attr remark;
  @attr('datetime') publicationDate;
  @attr('boolean') finished;
  @attr('boolean') inNewsletter;

  get modelName() {
    return this.constructor.modelName;
  }

  @hasMany('agenda-item-treatment') agendaItemTreatments;
  @hasMany('piece', { inverse: null }) attachments;
  @hasMany('themes', { inverse: null }) themes;
}
