import Service, { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  task, timeout
} from 'ember-concurrency';
import { A } from '@ember/array';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';

export default class ToasterService extends Service {
  @service intl;

  @tracked toasts = A([]);

  // TODO: Below "newToasts" & "oldToasts" getters are a temporary to be able to render "old toasts" that
  // don't have an equivalent in new design yet, while already implementing new design for those types that support it.
  get newToasts() {
    return this.toasts.filter((toast) => ['success', 'warning', 'error', 'info'].includes(toast.options.type));
  }

  get oldToasts() {
    return this.toasts.filter((toast) => !this.newToasts.includes(toast));
  }

  @task
  *displayToast(toast) {
    toast.options.onClose = toast.options.onClose || (() => removeObject(this.toasts, toast));
    this.toasts.push(toast);
    // TODO: At first glance one might think the below timeout doesn't work properly after 5 seconds. This is caused by following CSS-animation: https://github.com/kanselarij-vlaanderen/au-kaleidos-css/blob/766b9b410fae626988fc7bf0542437889c4e94b7/_auk-alert-stack.scss#L24
    yield timeout(toast.options.timeOut);
    removeObject(this.toasts, toast);
  }

  notify(message, title, options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    options.type = options.type || 'info';
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
    options.type = 'info';
    options.icon = 'info-circle';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 2000;
    }
    return this.notify(message, title, options);
  }

  success(message, title, options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    options.type = 'success';
    options.icon = 'check';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 3200;
    }
    return this.notify(message, title, options);
  }

  warning(message, title, options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    options.type = 'warning';
    options.icon = 'alert-triangle';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 5000;
    }
    return this.notify(message, title, options);
  }

  error(message, title, options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    options.type = 'error';
    options.icon = 'circle-x';
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
    options.type = 'info';
    options.icon = 'renew';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 10000;
    }
    return this.notify(message, title, options);
  }

  @action
  clear(toast) {
    if (arguments.length > 0) {
      removeObject(this.toasts, toast);
    } else {
      this.toasts.clear();
    }
  }
}
