import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

export default class PlausibleClickWithRoleModifier extends Modifier {
  @service plausible;
  @service currentSession;

  positional;
  named;

  get eventName() {
    return this.positional[0];
  }

  get props() {
    return this.named;
  }

  onClick = () => {
    const props = { ...this.props, rol: this.currentSession.role.label };
    this.plausible.trackEvent(this.eventName, props);
  }

  modify(element, positional, named) {
    this.positional = positional;
    this.named = named;
    element.addEventListener('click', this.onClick);
  }
}
