import Service from '@ember/service';
import { run } from '@ember/runloop';
import { classify, dasherize } from '@ember/string';
import { getOwner } from '@ember/application';
import Evented from '@ember/object/evented';
import { tracked, TrackedObject } from 'tracked-built-ins';

export default class ResponsiveService extends Service.extend(Evented) {
  @tracked _matches = [];

  listeners = {};
  matchers = {};
  mql = window?.matchMedia;

  get enabled() {
    return !!this.mql;
  }

  get matches() {
    return this._matches.length ? this._matches : [];
  }

  set matches(value) {
    this._matches = value;
  }

  constructor() {
    super(...arguments);

    const breakpoints = getOwner(this).lookup('breakpoints:main');

    if (!breakpoints || !this.enabled) {
      return;
    }

    Object.keys(breakpoints).forEach((name) => {
      const getterName = `is${classify(name)}`;

      Object.defineProperties(this, {
        [getterName]: new TrackedObject({
          get() {
            return this.matches.indexOf(name) > -1;
          }
        }),
        [name]: new TrackedObject({
          get() {
            return this[getterName];
          }
        })
      });

      this.match(name, breakpoints[name]);
    });
  }

  get classNames() {
    return this.matches.map((match) => `auk-media-${dasherize(match)}`).join(' ');
  }

  _triggerEvent() {
    run(this, this.trigger('mediaChanged', {}));
  }

  match(name, query) {
    if (!this.enabled) {
      return;
    }

    const mql = this.mql,
      matcher = mql(query);

    const listener = (matcher) => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      this.matchers[name] = matcher;

      if (matcher.matches) {
        this.matches = Array.from(new Set([...this.matches, name]));
      } else {
        this.matches = Array.from(
          new Set(this.matches.filter((key) => key !== name))
        );
      }

      if (this.listeners[name] !== matcher) {
        this._triggerEvent();
      }
    };

    this.listeners[name] = listener;

    matcher.addEventListener('change', (matcher) => {
      run(null, listener, matcher);
    });

    listener(matcher);
  }
}
