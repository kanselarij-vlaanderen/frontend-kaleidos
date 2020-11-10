import DS from 'ember-data';
import { inject as service } from '@ember/service';

const {
  Model,
} = DS;

export default Model.extend({
  intl: service(),
  toaster: service(),

  checkIfCreatedNotificationShouldBeShown(type) {
    const modelListToNotShowNotificationFor = ['genders', 'formally-oks', 'confidentialities', 'approvals', 'alert-types', 'agenda-activities', 'meetings', 'contact-persons', 'publication-flow'];
    return !(modelListToNotShowNotificationFor.includes(type));
  },
  checkIfUpdatedNotificationShouldBeShown(type) {
    const modelListToNotShowNotificationFor = ['agendaitem', 'newsletter-info', 'contact-person', 'publication-flow'];
    return !(modelListToNotShowNotificationFor.includes(type));
  },
  translateAndParseSuccesType(type) {
    return this.intl.t(type).toLowerCase();
  },

  async save() {
    const dirtyType = this.get('dirtyType');
    switch (dirtyType) {
      case 'created':
        if (this.checkIfCreatedNotificationShouldBeShown(this.get('constructor.modelName'))) {
          this.toaster.success(this.intl.t('successfully-created', {
            type: this.translateAndParseSuccesType(this.get('constructor.modelName')),
          }),
          this.intl.t('successfully-created-title'));
        }
        break;
      case 'updated':
        if (this.checkIfUpdatedNotificationShouldBeShown(this.get('constructor.modelName'))) {
          this.toaster.success(this.intl.t('successfully-saved-type', {
            type: this.translateAndParseSuccesType(this.get('constructor.modelName')),
          }),
          this.intl.t('successfully-created-title'));
        }
        break;
      case 'deleted':
        this.toaster.success(this.intl.t('successfully-deleted'), this.intl.t('successfully-created-title'));
        break;
    }
    return this._super(...arguments);
  },
});
