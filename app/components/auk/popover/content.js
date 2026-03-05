import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import FloatingUiModifier from '../../../modifiers/floating-ui';

export default class Content extends Component {
  @tracked arrowElement;
  floatingUi = FloatingUiModifier;

  arrow = modifier((element) => {
    this.arrowElement = element;
  });

  closeOnEscapePress = modifier(() => {
    const listener = (event) => {
      if (event.key === 'Escape') {
        this.args.hide();
      }
    };

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  });

  @action
  clickOutsideDeactivates(event) {
    const isClosedByToggleButton = this.args.targetElement?.contains(
      event.target,
    );

    if (!isClosedByToggleButton) {
      this.args.hide();
    }

    return true;
  }
}
