import Component from '@ember/component';
import { all } from 'rsvp';

export default Component.extend({
  placeholder: '...',
  model: null,
  path: null,
  value: null,
  loading: true,
  waitFor: null,

  didInsertElement() {
    this._super(...arguments);
    let promisesToWaitFor = this.waitFor || [];
    if (typeof promisesToWaitFor === 'string') {
      promisesToWaitFor = [promisesToWaitFor];
    }
    all(promisesToWaitFor.map((path) => this.model.get(path))).then(() => {
      const value = Promise.resolve(this.model.get(this.path));
      value.then((result) => {
        if (!this.isDestroying) {
          this.set('value', result);
        }
      })
        .catch((error) => {
          console.error(`failed to render delayed property '${this.path}': ${error}`);
        })
        .then(() => {
          if (!this.isDestroying) {
            this.set('loading', false);
          }
        });
    });
  },
});
