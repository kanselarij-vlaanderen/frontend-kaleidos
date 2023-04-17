import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { inject as service } from '@ember/service';

export default class PlausibleClickWithRoleModifier extends Modifier {
  @service plausible;
  @service currentSession;


  modify(element, [eventName], props) {
    const onClick = () => {
      const _props = { ...props, rol: this.currentSession.role.label };
      this.plausible.trackEvent(eventName, _props);
    }

    element.addEventListener('click', onClick);

    registerDestructor(this, () => {
      element.removeEventListener('click', onClick);
    });
  }
}
