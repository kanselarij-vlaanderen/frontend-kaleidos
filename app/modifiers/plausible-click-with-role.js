import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

export default class PlausibleClickWithRoleModifier extends Modifier {
  @service plausible;
  @service currentSession;

  get eventName() {
    return this.args.positional[0];
  }

  get props() {
    return this.args.named;
  }

  onClick = () => {
    const props = { ...this.props, rol: this.currentSession.role.label };
    this.plausible.trackEvent(this.eventName, props);
  }

  didInstall() {
    this.element.addEventListener('click', this.onClick);
  }

  willRemove() {
    this.element.removeEventListener('click', this.onClick);
  }
}
