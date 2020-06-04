import DS from 'ember-data';
import { inject as service } from '@ember/service';

export default DS.JSONAPIAdapter.extend({
  defaultSerializer: 'JSONAPISerializer',
  intl: service(),
  toaster: service(),

  translateAndParseSuccesType(type) {
    const singular = type.slice(0, -1)
    return this.intl.t(singular).toLowerCase();
  },

  handleResponse: function (status, headers, payload, requestData) {
    if (!this.isSuccess(status, headers, payload)) {
      switch (status) {
        case 400:
          this.toaster.error(this.intl.t('error-bad-request'), this.intl.t('warning-title'));
          break;
        case 404:
          this.toaster.error(this.intl.t('error-not-found'), this.intl.t('warning-title'));
          break;
        case 500:
          this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
          break;
        default:
          return new DS.InvalidError(status);
      }
    } else {
      switch (status) {
        case 201:
          if (payload && payload.data && this.checkIfNotificationShouldBeShown(payload.data.type)) {
            this.toaster.success(this.intl.t('successfully-created', {type: this.translateAndParseSuccesType(payload.data.type)}),
              this.intl.t('successfully-created-title'));
          }
          break;
        case 204:
          if (requestData && requestData.method === "DELETE") {
            this.toaster.success(this.intl.t('successfully-deleted'), this.intl.t('successfully-created-title'));
          } else if (requestData && requestData.method === "PATCH") {
            // Toast for newer models (with modifier locking) are thrown from the model.
            // Not form here.
            if (!this.checkIfNotificationShouldBeShownInModel(requestData.url)) {
              this.toaster.success(this.intl.t('successfully-saved'), this.intl.t('successfully-created-title'));
            }
          } else {
            this.toaster.success(this.intl.t('successfully-saved'), this.intl.t('successfully-created-title'));
          }
          break;
        default:
          return this._super(...arguments);
      }

      return this._super(...arguments);
    }
  },



  checkIfNotificationShouldBeShownInModel(requestUrl) {
    return requestUrl.includes('agendaitems/') || requestUrl.includes('newsletter-infos/');
  },

  checkIfNotificationShouldBeShown(type) {
    const modelListToNotShowNotificationFor = ['genders', 'formally-oks', 'confidentialities', 'approvals', 'alert-types', 'agenda-activities', 'meetings', 'postponeds'];
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
