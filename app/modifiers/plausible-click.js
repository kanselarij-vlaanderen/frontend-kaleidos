import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { inject as service } from '@ember/service';

export default class PlausibleClickModifier extends Modifier {
  @service plausible;

  modify(element, [eventName], props) {
    const onClick = () => {
      this.plausible.trackEvent(eventName, props)
    };

    element.addEventListener('click', onClick);

    registerDestructor(this, () => {
      element.removeEventListener('click', onClick);
    });
  }
}
