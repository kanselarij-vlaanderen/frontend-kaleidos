import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { isEnabledCabinetSubmissions } from 'frontend-kaleidos/utils/feature-flag';

/**
 * @argument onSetFilter
 * @argument submissionFilter: filter's initial value
 */
export default class SubmissionsHeader extends Component {
  @service currentSession;
  @service router;
  @service store;

  @tracked isOpenAddSubmissionModal = false;

  @tracked linkedMandatees;

  constructor() {
    super(...arguments);
    this.loadLinkedMandatees.perform();
  }

  loadLinkedMandatees = task(async () => {
    this.linkedMandatees = await this.store.queryAll('mandatee', {
      'filter[user-organizations][:id:]': this.currentSession.organization.id,
      'filter[:has-no:end]': true,
      include: 'mandate.role',
      sort: 'start',
    });
  });

  get mayCreateSubmissions() {
    return this.currentSession.may('create-submissions') && this.linkedMandatees?.length && isEnabledCabinetSubmissions();
  }
}
