import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

export default class ApplicationAdapter extends JSONAPIAdapter {
  @service intl;
  @service toaster;

  MAX_AJAX_RETRIES = 5;

  // eslint-disable-next-line no-unused-vars
  async ajax(url, method) {
    try {
      if (['POST', 'DELETE'].includes(method)) { // methods that cause unwanted effects when executing a request multiple times
        return await super.ajax(...arguments);
      }
      return await retryOnError(super.ajax.bind(this), arguments); // return-await of importance to be able to catch errors
    } catch (error) {
      this.toaster.error(this.intl.t('couldnt-answer-net-req'));
      throw error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  handleResponse(status, headers, payload, requestData) {
    if (!this.isSuccess(status, headers, payload)) {
      this.toaster.error(this.intl.t('invalid-net-req-answer'));
    }
    return super.handleResponse(...arguments);
  }
}

// from https://github.com/lblod/frontend-gelinkt-notuleren/blob/5d3c17e9c084e13ea8354c81bf378a27043d7e59/app/adapters/application.js
async function retryOnError(ajax, ajaxArgs, maxRetries = 5, retryCount = 0) {
  try {
    return await ajax(...ajaxArgs);
  } catch (error) {
    if (retryCount < maxRetries) {
      await sleep(250 * (retryCount + 1));
      return retryOnError(ajax, ajaxArgs, maxRetries, retryCount + 1);
    }
    throw error;
  }
}

function sleep(time) {
  return new Promise((resolve) => later(this, () => resolve(true), time));
}
