import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

export default class PlausibleClickModifier extends Modifier {
  @service plausible;

  positional;
  named;

  get eventName() {
    return this.positional[0];
  }

  get props() {
    return this.named;
  }

  onClick = () => {
    this.plausible.trackEvent(this.eventName, this.props);
  }

  modify(element, positional, named) {
    this.positional = positional;
    this.named = named;
    element.addEventListener('click', this.onClick);
  }
}
