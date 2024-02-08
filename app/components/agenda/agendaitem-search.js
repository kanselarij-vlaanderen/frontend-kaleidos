import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class AgendaItemSearch extends Component {
  @service currentSession;

  @tracked searchText;

  constructor() {
    super(...arguments);
    this.searchText = this.args.searchText || '';
  }

  get canEdit() {
    return this.currentSession.may('manage-agendaitems') && this.args.currentAgenda.status.get('isDesignAgenda');
  }

  @restartableTask
  *debouncedSearch() {
    yield timeout(500);
    yield this.search.perform();
  }

  @dropTask
  *search() {
    if (this.args.onSearch) {
      yield this.args.onSearch(this.searchText);
    }
  }
}
