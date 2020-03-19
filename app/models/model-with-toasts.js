import DS from 'ember-data';
import { inject as service } from '@ember/service';

let { Model, attr, belongsTo } = DS;

export default Model.extend({
  currentSession: service(),
  intl: service(),
  toaster: service(),
  modified: attr('datetime'),
  modifiedBy: belongsTo('user'),

  checkIfCreatedNotificationShouldBeShown(type) {
    const modelListToNotShowNotificationFor = ['subcase-phase-codes', 'genders', 'formally-oks', 'confidentialities', 'approvals', 'alert-types', 'subcase-phases', 'meetings', 'postponeds'];
    return !(modelListToNotShowNotificationFor.includes(type));
  },
  checkIfUpdatedNotificationShouldBeShown(type) {
    const modelListToNotShowNotificationFor = ['agendaitem', 'newsletter-info'];
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
          this.toaster.success(this.intl.t('successfully-created'), this.intl.t('successfully-created-title'));
        }
        break;
      case 'updated':
        if (this.checkIfUpdatedNotificationShouldBeShown(this.get('constructor.modelName'))) {
          this.toaster.success(this.intl.t('successfully-saved-type', { type: this.translateAndParseSuccesType(this.get('constructor.modelName')) }),
            this.intl.t('successfully-created-title'));
        }
        break;
      case 'deleted':
        this.toaster.success(this.intl.t('successfully-deleted'), this.intl.t('successfully-created-title'));
        break;
    }
    return this._super(...arguments);
  }
});
