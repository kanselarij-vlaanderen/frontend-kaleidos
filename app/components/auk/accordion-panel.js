import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

/**
 *
 * @argument title {String}
 * @argument isActive {Boolean}: Determines the active (open) state on display. "false" is the default value.
 */
export default class AuAccordionPanelItem extends Component {
  @tracked isActive = this.args.isActive || false;
  accordionPanelId = `accordion-panel-${guidFor(this)}`;

  @action
  toggleAccordionPanel() {
    this.isActive = !this.isActive;
  }
}
