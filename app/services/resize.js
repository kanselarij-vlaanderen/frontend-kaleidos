import { set } from '@ember/object';
import Evented from '@ember/object/evented';
import { cancel, debounce } from '@ember/runloop';
import Service from '@ember/service';
import { camelize } from '@ember/string';
import { RESIZE_SERVICE_DEFAULTS } from 'frontend-kaleidos/config/config';

class ResizeService extends Service.extend(Evented) {
  _oldWidth = window.innerWidth;
  _oldHeight = window.innerHeight;

  constructor() {
    super(...arguments);

    this._setConfig();
    this._onResizeHandler = event => {
      const scheduledDebounce = debounce(this, this._fireResizeNotification, event, this.debounceTimeout);
      this._scheduledDebounce = scheduledDebounce;
    };

    this._installResizeListener();
  }

  willDestroy() {
    super.willDestroy(...arguments);

    this._uninstallResizeListener();
    this._cancelScheduledDebounce();
  }

   _setConfig() {
    const defaults = (RESIZE_SERVICE_DEFAULTS === undefined ? {} : RESIZE_SERVICE_DEFAULTS);

    Object.keys(defaults).map((key) => {
      return set(this, camelize(key.toLowerCase()), defaults[key]);
    });
  }

  _hasWindowSizeChanged(w, h) {
    return (
      (this.widthSensitive && w !== this._oldWidth) || (this.heightSensitive && h !== this._oldHeight)
    );
  }

  _updateCachedWindowSize(w, h) {
    this._oldWidth = w;
    this._oldHeight = h;
  }

  _installResizeListener() {
    if (!this._onResizeHandler) {
      return;
    }
    window.addEventListener('resize', this._onResizeHandler);
  }

  _uninstallResizeListener() {
    if (!this._onResizeHandler) {
      return;
    }
    window.removeEventListener('resize', this._onResizeHandler);
  }

  _cancelScheduledDebounce() {
    if (!this._scheduledDebounce) {
      return;
    }
    cancel(this._scheduledDebounce);
  }

  _fireResizeNotification(event) {
    const { innerWidth, innerHeight } = window;
    if (this._hasWindowSizeChanged(innerWidth, innerHeight, true)) {
      this.trigger('resize', event);
      this._updateCachedWindowSize(innerWidth, innerHeight, true);
    }
  }
}

export default ResizeService;
