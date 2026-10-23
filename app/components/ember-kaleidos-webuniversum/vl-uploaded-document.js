import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

/**
 * @param name {string}
 * @param extension {string}
 * @param size {string}
 * @param downloadLink {string}
 * @param downloadName {string} Optional
 * @param onDelete {Function} Optional
 * @param loading {boolean} Optional
 */
export default class VlUploadedDocument extends Component {

  delete = task({ drop: true }, async () => {
    await this.args.onDelete();
  });

  get isDisabled() {
    return this.args.loading || this.delete.isRunning;
  }
}
