import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { copyText } from 'frontend-kaleidos/utils/copy-text-to-clipboard';

export default class ClipboardableComponent extends Component {
  @tracked showCopiedMessage = false;

  @action
  copyContent() {
    copyText(this.args.content).then(
      () => {
        this.showCopiedMessage = true;
      }
    );
  }
}
