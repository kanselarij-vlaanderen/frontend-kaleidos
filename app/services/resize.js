import { set } from '@ember/object';
import Evented from '@ember/object/evented';
import { cancel, debounce } from '@ember/runloop';
import Service from '@ember/service';
import { classify } from '@ember/string';

class ResizeService extends Service.extend(Evented) {
  _oldWidth = window.innerWidth;
  _oldHeight = window.innerHeight;
  _oldWidthDebounced = window.innerWidth;
  _oldHeightDebounced = window.innerHeight;

  constructor() {
    super(...arguments);

    this._setDefaults();
    this._onResizeHandler = event => {
      this._fireResizeNotification(event);
      const scheduledDebounce = debounce(this, this._fireDebouncedResizeNotification, event, this.debounceTimeout);
      this._scheduledDebounce = scheduledDebounce;
    };
    this._installResizeListener();
  }

  willDestroy() {
    super.willDestroy(...arguments);

    this._uninstallResizeListener();
    this._cancelScheduledDebounce();
  }

   _setDefaults() {
    const defaults = (this.resizeServiceDefaults === undefined ? {} : this.resizeServiceDefaults);

    Object.keys(defaults).map((key) => {
      const classifiedKey = classify(key);
      const defaultKey = `default${classifiedKey}`;
      return set(this, defaultKey, defaults[key]);
    });
  }

  _hasWindowSizeChanged(w, h, debounced = false) {
    const wKey = debounced ? '_oldWidthDebounced' : '_oldWidth';
    const hKey = debounced ? '_oldHeightDebounced' : '_oldHeight';
    return (
      (this.widthSensitive && w !== wKey) || (this.heightSensitive && h !== hKey)
    );
  }

  _updateCachedWindowSize(w, h, debounced = false) {
    const wKey = debounced ? '_oldWidthDebounced' : '_oldWidth';
    const hKey = debounced ? '_oldHeightDebounced' : '_oldHeight';
    this.set(wKey, w);
    this.set(hKey, h);
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
    if (this._hasWindowSizeChanged(innerWidth, innerHeight)) {
      this.trigger('didResize', event);
      this._updateCachedWindowSize(innerWidth, innerHeight);
    }
  }
  _fireDebouncedResizeNotification(event) {
    const { innerWidth, innerHeight } = window;
    if (this._hasWindowSizeChanged(innerWidth, innerHeight, true)) {
      this.trigger('debouncedDidResize', event);
      this._updateCachedWindowSize(innerWidth, innerHeight, true);
    }
  }
}

export default ResizeService;
