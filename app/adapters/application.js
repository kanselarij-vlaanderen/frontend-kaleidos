import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  defaultSerializer: 'JSONAPISerializer',

  ajax() {
    const args = [].slice.call(arguments);
    if (args[1] === 'DELETE') {
      // eslint-disable-next-line prefer-spread
      return this._super.apply(this, args);
    }
    const originalData = args[2] && args[2].data;

    const original = this._super;
    let retries = 0;
    const retry = (error) => {
      if (retries < 3) {
        retries += 1;
        const originalResult = original.apply(this, args);
        return originalResult.catch((catchError) => {
          if (originalData) {
            args[2].data = typeof originalData === 'string' ? JSON.parse(originalData) : originalData;
          }
          return retry(catchError);
        });
      }
      return Promise.reject(error);
    };
    return retry();
  }
  ,
});
