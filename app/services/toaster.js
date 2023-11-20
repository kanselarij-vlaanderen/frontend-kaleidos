import AuToasterService from '@appuniversum/ember-appuniversum/services/toaster';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ToasterService extends AuToasterService {
  @service intl;

  show(component, options = {}) {
    return super.show(component, options);
  }

  info(message, title, options = {}) {
    options.icon = 'info-circle';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 2000;
    }
    return super.notify(message, title, options);
  }

  success(message, title, options = {}) {
    options.icon = 'check';
    options.closable = options.closable || false;
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 3200;
    }
    return super.success(message, title, options);
  }

  warning(message, title, options = {}) {
    options.icon = 'alert-triangle';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 5000;
    }
    return super.warning(message, title, options);
  }

  error(message, title, options = {}) {
    options.icon = 'circle-x';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 60000;
    }
    if (!(message || title)) {
      message = this.intl.t('error');
      title = this.intl.t('warning-title');
    }
    return super.error(message, title, options);
  }

  loading(message, title, options = {}) {
    options.icon = 'renew';
    options.closable = false;
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 10000;
    }
    return super.loading(message, title, options);
  }

  @action
  clear(toast) {
    super.close(toast);
  }
}
