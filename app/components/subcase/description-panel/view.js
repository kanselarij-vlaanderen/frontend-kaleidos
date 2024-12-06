import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';

export default class SubcaseDescriptionView extends Component {
  /**
   * @argument subcase
   * @argument onClickEdit
   */
  @service store;
  @service currentSession;
  @service subcaseService;

  @tracked postponedMeetingModels = null; // This is only used for Minister/KBD when the subcase has been postponed and is on a design agenda
  @tracked latestMeetingModels = null;

  @tracked latestDecisionActivity = null;

  constructor() {
    super(...arguments);
    this.loadAgendaData.perform();
    this.loadComments.perform();
  }

  loadComments = task(async () => {
    const retrievedPieces = await this.store.queryAll('retrieved-piece', {
      'filter[parliament-retrieval-activity][generated-subcase][:id:]':
        this.args.subcase.id,
    });
    if (!retrievedPieces) {
      this.comments =  [];
    } else {
      this.comments = retrievedPieces
        .map((piece) => piece.comment)
        .filter((comment) => comment?.length);
    }
  });

  get canShowDecisionStatus() {
    return (
      this.isFinalMeeting &&
      (this.currentSession.may('view-decisions-before-release') ||
        this.latestMeetingModels?.meeting?.internalDecisionPublicationActivity?.get(
          'startDate'
        ))
    );
  }

  get isFinalMeeting() {
    return isPresent(this.latestMeetingModels?.meeting?.agenda?.get('id'));
  }

  loadAgendaData = task(async () => {
    // Returns a sorted array of JSON representations of [meeting, agenda, agendaitem]
    // Ordered on meeting start date in descending order (first item is latest meeting)
    const relatedAgendas = await this.subcaseService.getRelatedAgendas(this.args.subcase);

    if (relatedAgendas.length === 0)
      return;

    // Check if we can access the last agenda using Ember Data, that means it
    // has been propagated and we only care about the latest agenda
    const lastRecord = relatedAgendas[0];
    if (lastRecord.visible) {
      // The latest meeting is visible to the current user
      // We can just fetch it using the store and use the real records
      const meeting = await this.store.findRecord('meeting', lastRecord.meeting.id);
      const agenda = await this.store.findRecord('agenda', lastRecord.agenda.id);
      const agendaitem = await this.store.findRecord('agendaitem', lastRecord.agendaitem.id);
      this.latestMeetingModels = { meeting, agenda, agendaitem };
    } else {
      // The latest meeting is not visible, we should display it but not as a link
      const visibleRecord = relatedAgendas.find((record) => record.visible);

      // At least one meeting must be visible to the user to display
      // If no meeting is yet propagated, we also don't show the unpropagated one
      if (visibleRecord) {
        const meeting = await this.store.findRecord('meeting', visibleRecord.meeting.id);
        const agenda = await this.store.findRecord('agenda', visibleRecord.agenda.id);
        const agendaitem = await this.store.findRecord('agendaitem', visibleRecord.agendaitem.id);

        this.postponedMeetingModels =  {
          meeting: lastRecord.meeting,
          agenda: lastRecord.agenda,
          agendaitem: lastRecord.agendaitem
        };
        this.latestMeetingModels = { meeting, agenda, agendaitem };
      }
    }

    this.latestDecisionActivity = this.subcaseService.getLatestDecisionActivity(this.args.subcase);
  });
}
