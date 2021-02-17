import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class LoadingOverlay extends Component {
  @service() intl;

  get getSize() {
    if (this.args.size) {
      return `${this.args.size}`;
    }
    return 'xsmall';
  }

  get getTitle() {
    if (this.args.title) {
      return `${this.args.title}`;
    }
    return this.intl.t('loading-text');
  }

  get getMessage() {
    if (this.args.message) {
      return `${this.args.message}`;
    }
    return `${this.intl.t('saving-change-message')} ${this.intl.t('please-be-patient')}`;
  }
}
