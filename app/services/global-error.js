import Service from '@ember/service';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import EmberObject from '@ember/object';

export default Service.extend({
  intl: inject(),
  type: 'error',
  shouldUndoChanges: false,

  init() {
    this._super(...arguments);
    this.set('messages', []);
  },

  showToast: task(function* (messageToAdd, duration) {
    if (messageToAdd.get('type') != 'warning-undo') {
      const messageTypeAlreadyFound = this.messages.find((item) => item.get('type') === messageToAdd.get('type'));
      if (messageTypeAlreadyFound) {
        return;
      }
    }

    if (this.messages.get('length') >= 3) {
      const firstObject = this.messages.get('firstObject');
      this.messages.removeObject(firstObject);
    }
    this.messages.addObject(messageToAdd);

    switch (messageToAdd.type) {
      case 'error':
        yield timeout(duration || 3000);
        break;
      case 'success':
        yield timeout(duration || 2000);
        break;
      case 'warning-undo':
        yield timeout(duration || 15000);
        break;
      case 'file-download':
        yield timeout(duration || 15000);
        break;
    }
    if (this.messages.includes(messageToAdd)) {
      this.messages.removeObject(messageToAdd);
    }
  }),

  handleError() {
    this.showToast.perform(EmberObject.create({
      title: this.intl.t('warning-title'),
      message: this.intl.t('error'),
      type: this.type
    }))
  }
});
