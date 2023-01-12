import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * @param name {string}
 * @param extension {string}
 * @param size {string}
 * @param downloadLink {string}
 * @param downloadName {string} Optional
 * @param view {Function} Optional
 * @param download {Function} Optional, overrides use of downloadLink argument
 * @param delete {Function} Optional
 */
export default class EmberKaleidosWebuniversumVlUploadedDocument extends Component {
  @action
  view() {
    this.args.view?.(...arguments);
  }

  @action
  download() {
    this.args.download?.(...arguments);
  }

  @action
  delete() {
    this.args.delete?.(...arguments);
  }
}
