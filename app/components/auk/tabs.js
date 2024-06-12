import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';

/**
 *
 * @argument {Boolean} reversed
 * @argument {Boolean} responsive
 * @argument {Boolean} vertical
 * @argument {Boolean} expanded
 */

export default class Tabs extends Component {
  @service router;
  @service intl;
  @tracked dropdownOpen = false;
  @tracked activeRouteName = '';

  dropdownElement = null;

  constructor() {
    super(...arguments);
    // Bind the method to ensure 'this' context and add event listener if responsive.
    this.handleClickOutside = this.handleClickOutside.bind(this);
    // Bind closeDropdownOnRouteChange method once so it can be properly added and removed
    this.boundCloseDropdownOnRouteChange = this.closeDropdownOnRouteChange.bind(this);
  
    if (this.args.responsive) {
      this.setupResponsiveFeatures();
    }
  }

  setupResponsiveFeatures() {
    this.router.on('routeDidChange', this.boundCloseDropdownOnRouteChange);
    document.addEventListener('click', this.handleClickOutside);
  }

  get reversed() {
    return this.args.reversed ? 'auk-tabs--reversed' : '';
  }

  get vertical() {
    return this.args.vertical ? 'auk-tabs--vertical' : '';
  }

  get verticalHolder() {
    return this.args.vertical ? 'auk-tabs-holder--vertical' : '';
  }

  get responsive() {
    return this.args.responsive ? 'auk-tabs--responsive' : '';
  }

  get expanded() {
    return this.args.expanded;
  }

  get responsiveBreakpoint() {
    if (this.args.responsive && !this.args.responsiveBreakpoint) {
      return 'auk-tabs-holder--small'; // Default to small if responsive is true but no breakpoint is set
    }

    switch (this.args.responsiveBreakpoint) {
      case 'small':
        return 'auk-tabs-holder--small';
      case 'medium':
        return 'auk-tabs-holder--medium';
      case 'large':
        return 'auk-tabs-holder--large';
      default:
        return '';
    }
  }

  @action
  didInsertAukTabs(element) {
    this.dropdownElement = element;
    later(this, this.updateActiveRouteName, 50); 
  }

  @action updateActiveRouteName() {
    const activeLink = this.dropdownElement.querySelector('.auk-tabs__tab__link--active');
    const label = activeLink ? activeLink.querySelector('.auk-sidebar__label') : null;
    const buttonLabel = this.args.label || 'Laden';

    // Check if a sublabel was found, otherwise use the activeLink's innerText
    if (label) {
      this.activeRouteName = label.innerText;
    } else if (activeLink) {
      this.activeRouteName = activeLink.innerText;
    } else {
      // Optionally handle the case where no active link or sublabel is found
      this.activeRouteName = buttonLabel;
    }
  }

  @action
  toggleDropdown() {
    if (!this.args.responsive) return;

    this.dropdownOpen = !this.dropdownOpen;
  }

  @action
  closeDropdown() {
    this.dropdownOpen = false;
  }

  @action
  closeDropdownOnRouteChange() {
    this.closeDropdown();
    later(this, this.updateActiveRouteName, 50); 
  }

  handleClickOutside(event) {
    if (!this.args.responsive || !this.dropdownOpen) return;

    if (!this.dropdownElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.args.responsive) {
      this.router.off('routeDidChange', this.boundCloseDropdownOnRouteChange);
      document.removeEventListener('click', this.handleClickOutside);
    }
  }
}