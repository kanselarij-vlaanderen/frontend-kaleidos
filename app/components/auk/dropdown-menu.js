import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

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
    // if @layout is defined as `icon-left` pass null to initiator component (because it is the default value of @layout within Button/ButtonLink component)
    // else just pass the layout argument
    if (this.args.layout) {
      return this.args.layout === 'icon-left' ? null : this.args.layout;
    }

    // if no @label argument is present just pass `icon-only`
    if (!isPresent(this.args.label)) {
      return 'icon-only';
    }

    // default value to pass
    return 'icon-right';
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

  get block() {
    return this.args.block || false;
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
