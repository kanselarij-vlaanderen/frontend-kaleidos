import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';

export default class CasesParliamentDocumentVersionsPanelComponent extends Component {
  @service store;

  @cached
  get submissionActivities() {
    return new TrackedAsyncData(
      this.store.queryAll('parliament-submission-activity', {
        'filter[parliament-subcase][parliament-flow][:id:]':
          this.args.parliamentFlow.id,
        sort: '-start-date'
      })
    );
  }
}
