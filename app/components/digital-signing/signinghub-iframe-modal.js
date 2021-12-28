import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class SigninghubIframeModalComponent extends Component {
  /**
   * Fullscreen modal containing SigningHub Iframe
   *
   * @argument signingFlow
   * @argument onClose
   */
  @tracked iframeSrc;

  constructor() {
    super(...arguments);
    this.loadSigningHubUrl.perform();
  }

  /**
   * @private
   * @param {number} signFlowId
   * @returns { { url: string } }
   */
  @task
  *loadSigningHubUrl() {
    const resp = yield fetch(
      `/signing-flow/${this.args.signingFlow.id}/signinghub-url?collapse_panels=false`
    );
    // TODO: error handling
    // TODO: intercept redirect rather than passing the url in json payload
    const data = yield resp.json();
    this.iframeSrc = data.url;
  }

  @action
  onLoadIframe(event) {
    try {
      // If we can access below property, we didn't bump in to a cors error, which
      // in turn means that the iframe redirected back to our domain, because it was done
      // with the required user-interaction
      /** @todo Verify whether this works when deployed */
      if (event.target.contentWindow.location.origin) {
        this.isShown = false;
        this.close();
      }
    } catch (err) {
      // To some other internal domain. This probably only occurs on initial load.
    }
  }

  @action
  close() {
    this.args.onClose();
  }
}
