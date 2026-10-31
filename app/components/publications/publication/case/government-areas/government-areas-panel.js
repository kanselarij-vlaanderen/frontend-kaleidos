import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
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

  loadData = task(async () => {
    this.governmentAreas = await this.args.publicationFlow.governmentAreas;
    const isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(
        this.args.publicationFlow
      );
    const decisionActivity = await this.args.publicationFlow.decisionActivity;
    if (isViaCouncilOfMinisters && decisionActivity) {
      const [meetingId, agendaId] =
        await this.publicationService.getModelsForAgendaitemFromDecisionActivity(
          decisionActivity
        );
      this.meeting = await this.store.findRecord('meeting', meetingId);
      this.agenda = await this.store.findRecord('agenda', agendaId);
    }
  });

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    this.args.publicationFlow.governmentAreas = newGovernmentAreas;
    await this.args.publicationFlow.save();
  }
}
