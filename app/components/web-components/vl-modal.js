import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[role="input"]:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  '[role="select"]:not([disabled]):not([aria-hidden])',
  '[role="textarea"]:not([disabled]):not([aria-hidden])',
  '[role="button"]:not([disabled]):not([aria-hidden])',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])'
];

/**
 * @param clickOutside {Boolean}
 * @param showCloseButton {Boolean}
 * @param isDocumentViewer {Boolean}
 * @param disableFocus {Boolean}
 * @param title {string}
 * @param closeModal {Function}
 */
export default class WebComponentsVlModal extends Component {
  @tracked element;

  get showCloseButton() {
    return this.args.showCloseButton ?? true;
  }

  get focusableNodes() {
    return Array(...this.element.querySelectorAll(FOCUSABLE_ELEMENTS));
  }

  get sizeClass() {
    if (this.args.isDocumentViewer) {
      return 'auk-modal--full-screen';
    } else {
      return 'auk-modal--large';
    }
  }

  // credit: https://github.com/ghosh/Micromodal/blob/master/lib/src/index.js#L151
  maintainFocus(event) {
    // if disableFocus is true
    if (!this.element.contains(document.activeElement)) {
      this.focusableNodes[0].focus();
    } else {
      const focusedItemIndex = this.focusableNodes.indexOf(document.activeElement);

      if (event.shiftKey && focusedItemIndex === 0) {
        this.focusableNodes[this.focusableNodes.length - 1].focus();
        event.preventDefault();
      }

      if (!event.shiftKey && focusedItemIndex === this.focusableNodes.length - 1) {
        this.focusableNodes[0].focus();
        event.preventDefault();
      }
    }
  }

  @action
  focus(element) {
    this.element = element;
    if (!this.args.disableFocus) {
      if (this.focusableNodes.length > 1) {
        this.focusableNodes[1].focus();
      } else {
        this.element.querySelector('[role="dialog"]').focus();
      }
    }
  }

  @action
  keyDown(event) {
    if (event.key === 'Escape') {
      this.args.closeModal();
    }
    if (event.key === 'Tab') {
      this.maintainFocus(event);
    }
  }

  @action
  clickOutside() {
    if (this.clickOutside) {
      this.args.closeModal();
    }
  }
}
