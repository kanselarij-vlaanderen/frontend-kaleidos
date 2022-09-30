import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

/**
 * @param publicationFlow {PublicationFlow}
 */
export default class PublicationsPublicationCaseGovernmentAreasGovernmnetAreasPanel extends Component {
  @service store;
  @service publicationService;

  @tracked meeting;
  @tracked agenda;
  @tracked governmentAreas;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.governmentAreas = yield this.args.publicationFlow.governmentAreas;
    const isViaCouncilOfMinisters =
      yield this.publicationService.getIsViaCouncilOfMinisters(
        this.args.publicationFlow
      );
    const decisionActivity = yield this.args.publicationFlow.decisionActivity;
    if (isViaCouncilOfMinisters && decisionActivity) {
      const [meetingId, agendaId] =
        yield this.publicationService.getModelsForAgendaitemFromDecisionActivity(
          decisionActivity
        );
      this.meeting = yield this.store.findRecord('meeting', meetingId);
      this.agenda = yield this.store.findRecord('agenda', agendaId);
    }
  }

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = await this.args.publicationFlow.governmentAreas;

    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.args.publicationFlow.save();
  }
}
