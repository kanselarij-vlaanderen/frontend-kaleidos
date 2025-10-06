import { attr, belongsTo, hasMany } from '@ember-data/model';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';
import { inject as service } from '@ember/service';

export default class NewsItem extends ModelWithModifier {
  @service currentSession;
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

  @belongsTo('agenda-item-treatment', { inverse: 'newsItem', async: true })
  agendaItemTreatment;
  @belongsTo('user', { inverse: null, async: true }) isBeingEditedBy;

  @hasMany('theme', { inverse: null, async: true}) themes;

  async startEditing(newsItemIsNew) {
    await this.belongsTo('isBeingEditedBy').reload();
    if (!newsItemIsNew) {
      await this.preEditOrSaveCheck();
    }
    if (this.currentSession.user.id && !this.isBeingEditedBy?.id) {
      this.isBeingEditedBy = this.currentSession.user;
      return super.save(...arguments);
    }
  }

  async stopEditingOnSave() {
    await this.belongsTo('isBeingEditedBy').reload();
    await this.preEditOrSaveCheck();
    this.isBeingEditedBy = undefined;
    return super.save(...arguments);
  }

  async stopEditingOnCancel() {
    await this.belongsTo('isBeingEditedBy').reload();
    if (this.currentSession.user.id != this.isBeingEditedBy?.id) {
      return; // no save, canceled
    }
    await this.preEditOrSaveCheck();
    this.isBeingEditedBy = undefined;
    return super.save(...arguments);
  }
}
