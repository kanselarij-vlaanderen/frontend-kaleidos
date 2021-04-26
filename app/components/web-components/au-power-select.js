import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class PowerSelect extends Component {
  // Services.
  @service intl;

  get options() {
    if (this.args.options) {
      return this.args.options;
    }
    return null;
  }

  get getMatchesMessage() {
    if (this.args.noMatchesMessage) {
      return this.args.noMatchesMessage;
    }
    return this.intl.t('no-results-found');
  }

  get isSearchable() {
    return this.args.isSearchable;
  }

  get search() {
    return this.args.search;
  }

  get placeholder() {
    if (this.args.placeholder) {
      return this.args.placeholder;
    }
    return null;
  }

  get disabled() {
    return !!this.args.disabled;
  }
}
