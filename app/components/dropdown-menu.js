import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 *
 * @argument {String} placement. See EmberAttacher doc for options
 * @argument {String} skin. See Auk::Button for options
 * @argument {Boolean} disabled. See Auk::Button
 * @argument {String} icon. Name of the kaleidos-icon in case you want to provide a custom one (mostly used in icon-only settings where no label is provided)
 * @argument {String} label. Label for the trigger button
 */
export default class DropdownMenuComponent extends Component {
  @tracked isOpen = false;

  get placement() {
    return this.args.placement || 'bottom-end';
  }

  get icon() {
    if (this.args.icon) {
      return this.args.icon;
    }
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
