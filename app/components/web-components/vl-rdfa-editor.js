import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class WebComponentsVlRdfaEditor extends Component {
  @service userAgent;

  get browserName() {
    const browser = this.userAgent.browser;
    return browser.info.name;
  }

  get browserIsSupported() {
    const browser = this.userAgent.browser;
    return (window.Cypress
      || browser.isFirefox
      || browser.isChrome
      || browser.isChromeHeadless); // Headless in order not to break automated tests.
  }
}
