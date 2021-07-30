import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 *
 * @argument {String} placement. See EmberAttacher doc for options
 * @argument {String} skin. See Auk::Button for options
 * @argument {String} label. Label for the trigger button
 */
export default class DropdownMenuComponent extends Component {
  @tracked isOpen = false;

  get placement() {
    return this.args.placement || 'bottom-end';
  }

  get icon() {
    if (this.placement.startsWith('top')) {
      return 'chevron-up';
    }
    return 'chevron-down';
  }

  @action
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  @action
  setDropdownStatus(newstatus) {
    if (newstatus !== this.isOpen) {
      this.isOpen = newstatus;
    }
  }
}
