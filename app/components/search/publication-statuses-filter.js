import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class SearchPublicationStatusesFilterComponent extends Component {
  @service store;

  @tracked selectedStatusIds = this.args.selected || [];
  @tracked selectedStatuses = [];
  @tracked statuses = [];

  constructor() {
    super(...arguments);

    this.loadPublicationStatuses.perform();
  }

  loadPublicationStatuses = task(async () => {
    this.statuses = (await this.store.queryAll(
      'publication-status',
      { sort: 'position' },
    )).toArray();

    if (this.selectedStatusIds.length) {
      this.selectedStatuses = this.statuses.filter(decisionResultCode =>
        this.selectedStatusIds.includes(decisionResultCode.id)
      );
    }
  });

  @action
  onChangeStatuses(selectedStatuses) {
    this.selectedStatusIds = selectedStatuses.map((status) => status.id);
    this.args.onChange?.(this.selectedStatusIds);
  }
}
