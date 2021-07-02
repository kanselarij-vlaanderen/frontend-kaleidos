import Service, { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  task, timeout
} from 'ember-concurrency';
import { A } from '@ember/array';

export default class ToasterService extends Service {
  @service intl;

  @tracked toasts = A([]);

  // TODO: Below "newToasts" & "oldToasts" getters are a temporary to be able to render "old toasts" that
  // don't have new design yet according to their old design, while already implementing new design for those types that support it.
  get newToasts() {
    return this.toasts.filter((toast) => ['success', 'warning', 'error'].includes(toast.type));
  }

  get oldToasts() {
    return this.toasts.filter((toast) => !this.newToasts.includes(toast));
  }

  @(task(function *(toast) {
    toast.options.onClose = toast.options.onClose || (() => this.toasts.removeObject(toast));
    this.toasts.pushObject(toast);
    // TODO: At first glance one might think the below timeout doesn't work properly after 5 seconds. This is caused by following CSS-animation: https://github.com/kanselarij-vlaanderen/au-kaleidos-css/blob/766b9b410fae626988fc7bf0542437889c4e94b7/_auk-alert-stack.scss#L24
    yield timeout(toast.options.timeOut);
    if (this.toasts.includes(toast)) {
      this.toasts.removeObject(toast);
    }
  })) displayToast;

  notify(message, title, options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    options.type = options.type || 'success';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 3000;
    }
    const toast = {
      title,
      message,
      options,
    };
    this.displayToast.perform(toast);
    return toast;
  }

  info(message, title, options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 2000;
    }
    return this.notify(message, title, options);
  }

  success(message, title, options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    options.type = 'success';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 3200;
    }
    return this.notify(message, title, options);
  }

  warning(message, title, options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    options.type = 'warning';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 5000;
    }
    return this.notify(message, title, options);
  }

  error(message, title, options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    options.type = 'error';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 60000;
    }
    if (!(message || title)) { // TODO: revise naming/defaults, taken over from legacy global-error
      // eslint-disable-next-line no-param-reassign
      message = this.intl.t('error');
      // eslint-disable-next-line no-param-reassign
      title = this.intl.t('warning-title');
    }
    return this.notify(message, title, options);
  }

  loading(message, title, options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    options.type = 'loading';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 10000;
    }
    return this.notify(message, title, options);
  }

  @action
  clear(toast) {
    if (toast) {
      if (this.toasts.includes(toast)) {
        this.toasts.removeObject(toast);
      }
    }
    this.toasts.clear();
  }
}
