import JSONAPIAdapter from '@ember-data/adapter/json-api';

export default class ApplicationAdapter extends JSONAPIAdapter {
  // eslint-disable-next-line no-unused-vars
  ajax(url, method) {
    if (['POST', 'DELETE'].includes(method)) { // methods that cause unwanted effects when executing a request multiple times
      return super.ajax(...arguments);
    }

    return retryOnError(super.ajax.bind(this), arguments);
  }
}

// from https://github.com/lblod/frontend-gelinkt-notuleren/blob/5d3c17e9c084e13ea8354c81bf378a27043d7e59/app/adapters/application.js
async function retryOnError(ajax, ajaxArgs, retryCount = 0) {
  const MAX_RETRIES = 5;

  try {
    return await ajax(...ajaxArgs);
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await sleep(250 * (retryCount + 1));
      return retryOnError(ajax, ajaxArgs, retryCount + 1);
    }
    throw new Error(error);
  }
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(() => resolve(true), time));
}

