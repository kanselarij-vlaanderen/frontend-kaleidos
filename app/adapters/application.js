import DS from 'ember-data';
import {inject} from '@ember/service';
import EmberObject from '@ember/object';

export default DS.JSONAPIAdapter.extend({
  defaultSerializer: 'JSONAPISerializer',
  intl: inject(),
  globalError: inject(),

  handleResponse: function (status, headers, payload, requestData) {
    if (!this.isSuccess(status, headers, payload)) {
      switch (status) {
        case 400:
          this.globalError.showToast.perform(EmberObject.create({
            title: this.intl.t('warning-title'),
            message: this.intl.t('error-bad-request'),
            type: 'error'
          }));
          break;
        case 404:
          this.globalError.showToast.perform(EmberObject.create({
            title: this.intl.t('warning-title'),
            message: this.intl.t('error-not-found'),
            type: 'error'
          }));
          break;
        case 500:
          this.globalError.showToast.perform(EmberObject.create({
            title: this.intl.t('warning-title'),
            message: this.intl.t('error'),
            type: 'error'
          }));
          break;
        default:
          return new DS.InvalidError(status);
      }
    } else {
      switch (status) {
        case 201:
          if (payload && payload.data && this.checkIfNotificationShouldBeShown(payload.data.type)) {
            this.globalError.showToast.perform(EmberObject.create({
              title: this.intl.t('successfully-created-title'),
              message: this.intl.t('successfully-created', {type: this.translateAndParseSuccesType(payload.data.type)}),
              type: 'success'
            }));
          }
          break;
        case 204:
          if (requestData && requestData.method === "DELETE") {
            this.globalError.showToast.perform(EmberObject.create({
              title: this.intl.t('successfully-created-title'),
              message: this.intl.t('successfully-deleted'),
              type: 'success'
            }));
          } else if (requestData && requestData.method === "PATCH") {
            if(this.checkIfNotificationShouldBeShownInModel(requestData.url)) {
              this.globalError.showToast.perform(EmberObject.create({
                title: this.intl.t('successfully-created-title'),
                message: this.intl.t('successfully-saved'),
                type: 'success'
              }));
            }
          } else {
            this.globalError.showToast.perform(EmberObject.create({
              title: this.intl.t('successfully-created-title'),
              message: this.intl.t('successfully-saved'),
              type: 'success'
            }));

          }
          break;
        default:
          return this._super(...arguments);
      }

      return this._super(...arguments);
    }
  },

  translateAndParseSuccesType(type) {
    const singular = type.slice(0, -1)
    return this.intl.t(singular).toLowerCase();
  },

  checkIfNotificationShouldBeShownInModel(requestUrl) {
    return requestUrl.includes('agendaitems/') || requestUrl.includes('newsletter-infos/');
  },

  checkIfNotificationShouldBeShown(type) {
    const modelListToNotShowNotificationFor = ['subcase-phase-codes', 'genders', 'formally-oks', 'confidentialities', 'approvals', 'alert-types', 'subcase-phases', 'meetings', 'postponeds'];
    return !(modelListToNotShowNotificationFor.includes(type));
  },

  ajax: function () {
    let args = [].slice.call(arguments);
    let originalData;
    if (args[1] === "DELETE") {
      return this._super.apply(this, args);
    } else {
      originalData = args[2] && args[2].data;
    }

    let original = this._super;
    let retries = 0;
    let retry = (error) => {
      if (retries < 3) {
        retries++;
        let originalResult = original.apply(this, args);
        return originalResult.catch((error) => {
          if (originalData) {
            args[2].data = typeof originalData === 'string' ? JSON.parse(originalData) : originalData;
          }
          return retry(error);
        });
      } else {
        return Promise.reject(error);
      }
    };

    return retry();
  }
  ,
})
;
