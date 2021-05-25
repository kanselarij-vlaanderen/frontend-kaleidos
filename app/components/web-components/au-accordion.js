import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

export default class AuAccordion extends Component {
  @tracked isActive = true;
  accordionId = `accordion-${guidFor(this)}`;

  @action
  toggleAccordion() {
    this.isActive = !this.isActive;
  }
}
