import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import minimalInclude from 'frontend-kaleidos/utils/minimal-include';

export default class ApplicationAdapter extends JSONAPIAdapter {
  @service intl;
  @service toaster;

  // Method override from RESTAdapter base class
  // See: https://api.emberjs.com/ember-data/3.28/classes/RESTAdapter/methods/ajax?anchor=ajax
  // eslint-disable-next-line no-unused-vars
  async ajax(url, method) {
    try {
      if (['POST', 'DELETE'].includes(method)) { // methods that cause unwanted effects when executing a request multiple times
        return await super.ajax(...arguments);
      }
      return await this.retryOnError(super.ajax.bind(this), arguments); // return-await of importance to be able to catch errors
    } catch (error) {
      this.toaster.error(
        this.intl.t('couldnt-answer-net-req'),
        this.intl.t('warning-title')
      );
      throw error;
    }
  }

  buildQuery(snapshot) {
    const query = super.buildQuery(snapshot);
    if (query?.include) {
      query.include = minimalInclude(query.include.split(','));
    }
    return query;
  }

  buildURL(modelName, id, snapshot, requestType, query) {
    if (query?.include) {
      query.include = minimalInclude(query.include.split(','));
    }
    const url = super.buildURL(modelName, id, snapshot, requestType, query);
    return url;
  }

  // from https://github.com/lblod/frontend-gelinkt-notuleren/blob/5d3c17e9c084e13ea8354c81bf378a27043d7e59/app/adapters/application.js
  async retryOnError(ajax, ajaxArgs, maxRetries = 5, retryCount = 0) {
    try {
      return await ajax(...ajaxArgs);
    } catch (error) {
      if (retryCount === 0) { // Only warn on first-time occurence in order not to bug users with warnings on each retry.
        this.toaster.warning(
          this.intl.t('invalid-net-req-answer'),
          this.intl.t('warning-title')
        );
      }
      if (retryCount < maxRetries) {
        await sleep(250 * (retryCount + 1));
        return this.retryOnError(ajax, ajaxArgs, maxRetries, retryCount + 1);
      }
      throw error;
    }
  }
}


function sleep(time) {
  return new Promise((resolve) => later(this, () => resolve(true), time));
}
