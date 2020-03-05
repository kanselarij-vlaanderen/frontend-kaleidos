import DS from 'ember-data';
import {inject} from '@ember/service';
import EmberObject from '@ember/object';

let {Model, attr, belongsTo} = DS;

export default Model.extend({
  currentSession: inject(),
  intl: inject(),
  globalError: inject(),
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
    const singular = type.slice(0, -1)
    return this.intl.t(singular).toLowerCase();
  },

  async save() {
    const dirtyType = this.get('dirtyType');
    switch (dirtyType) {
      case 'created':
        if (this.checkIfCreatedNotificationShouldBeShown(this.get('constructor.modelName'))) {
          this.globalError.showToast.perform(EmberObject.create({
            title: this.intl.t('successfully-created-title'),
            message: this.intl.t('successfully-created', {type: this.get('constructor.modelName')}),
            type: 'success'
          }));
        }
        break;
      case 'updated':
        if (this.checkIfUpdatedNotificationShouldBeShown(this.get('constructor.modelName'))) {
          this.globalError.showToast.perform(EmberObject.create({
            title: this.intl.t('successfully-created-title'),
            message: this.intl.t('successfully-saved-type', {type: this.get('constructor.modelName')}),
            type: 'success'
          }));
        }
        break;
      case 'deleted':
        this.globalError.showToast.perform(EmberObject.create({
          title: this.intl.t('successfully-created-title'),
          message: this.intl.t('successfully-deleted'),
          type: 'success'
        }));
        break;
    }
    return this._super(...arguments);
  }
});
