import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

export default class AukMobileFiltersComponent extends Component {
  @tracked filtersOpen = false;

  constructor() {
    super(...arguments);
  }

  @action
  toggleFilters() {
    this.filtersOpen = !this.filtersOpen;

    if (isPresent(this.args.onToggle)) {
      this.args.onToggle(this.filtersOpen);
    }
  }

  @action
  closeFilters() {
    this.filtersOpen = false;
  }
}
