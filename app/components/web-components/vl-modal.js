import Component from '@ember/component';
import { computed } from '@ember/object';

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

export default Component.extend({
  isOverlay: null,
  large: false,
  clickOutside: false,
  showCloseButton: true,
  isDocumentViewer: null,
  disableFocus: false,

  didInsertElement() {
    if (!this.disableFocus) {
      const focusableNodes = this.getFocusableNodes();
      if (focusableNodes.length > 1) {
        focusableNodes[1].focus();
      } else {
        this.get('element').querySelector('[role="dialog"]')
          .focus();
      }
    }
  },

  keyDown(event) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
    if (event.key === 'Tab') {
      this.maintainFocus(event);
    }
  },

  sizeClass: computed('isDocumentViewer', function() {
    const {
      isDocumentViewer,
    } = this;
    if (isDocumentViewer) {
      return 'auk-modal--full-screen';
    }
    return 'auk-modal--large';
  }),

  getFocusableNodes() {
    const nodes = this.get('element').querySelectorAll(FOCUSABLE_ELEMENTS);
    return Array(...nodes);
  },

  // credit: https://github.com/ghosh/Micromodal/blob/master/lib/src/index.js#L151
  maintainFocus(event) {
    const focusableNodes = this.getFocusableNodes();

    // if disableFocus is true
    if (!this.get('element').contains(document.activeElement)) {
      focusableNodes[0].focus();
    } else {
      const focusedItemIndex = focusableNodes.indexOf(document.activeElement);

      if (event.shiftKey && focusedItemIndex === 0) {
        focusableNodes[focusableNodes.length - 1].focus();
        event.preventDefault();
      }

      if (!event.shiftKey && focusedItemIndex === focusableNodes.length - 1) {
        focusableNodes[0].focus();
        event.preventDefault();
      }
    }
  },

  actions: {
    close() {
      this.closeModal();
    },

    clickOutside() {
      if (this.clickOutside) {
        this.closeModal();
      }
    },
  },
});
