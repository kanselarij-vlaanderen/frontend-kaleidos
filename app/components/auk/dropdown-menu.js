import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import Button from './button';
import ButtonLink from './button-link';

/**
 *
 * @argument {String} type. Determines the type (Auk::Button & Auk::ButtonLink) of the initiator
 * @argument {String} placement. See EmberAttacher doc for options
 * @argument {String} skin. See Auk::Button & Auk::ButtonLink for options
 * @argument {Boolean} disabled. See Auk::Button
 * @argument {String} icon. Name of the kaleidos-icon in case you want to provide a custom one (mostly used in icon-only settings where no label is provided)
 * @argument {String} label. Label for the trigger button
 */
export default class DropdownMenuComponent extends Component {
  @tracked isOpen = false;

  get initiator() {
    return this.args.type === 'button-link' ? ButtonLink : Button;
  }

  get placement() {
    return this.args.placement || 'bottom-end';
  }

  get layout() {
    if (this.args.layout) {
      return this.args.layout;
    }
    if (this.args.label) {
      return 'icon-right';
    }
    return 'icon-only';
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
