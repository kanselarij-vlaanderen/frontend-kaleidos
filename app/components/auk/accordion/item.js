import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { isPresent } from '@ember/utils';

/**
 *
 * @argument title {String}
 * @argument layout {String}: Determines the position of the control. Possible values are: "controls-left" (default) & "controls-right".
 * @argument isActive {Boolean}: Determines the active (open) state on display. "false" is the default value.
 */
export default class AccordionItem extends Component {
  @tracked isActive = this.args.isActive || false;
  accordionId = `accordion-${guidFor(this)}`;

  get layout() {
    if (isPresent(this.args.layout)) {
      return this.args.layout;
    }
    return 'controls-left';
  }

  @action
  toggleAccordion() {
    this.isActive = !this.isActive;
  }
}
