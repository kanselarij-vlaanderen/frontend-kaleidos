import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

export default class PlausibleClickModifier extends Modifier {
  @service plausible;

  get eventName() {
    return this.args.positional[0];
  }

  get props() {
    return this.args.named;
  }

  onClick = () => {
    this.plausible.trackEvent(this.eventName, this.props);
  }

  didInstall() {
    this.element.addEventListener('click', this.onClick);
  }

  willRemove() {
    this.element.removeEventListener('click', this.onClick);
  }
}
