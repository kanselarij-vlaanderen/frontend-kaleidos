import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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
      let recordToUse = lastRecord;
      if (
        relatedAgendas.length > 1 &&
        lastRecord.decisionResultCode?.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN &&
        relatedAgendas[1].agendaActivity.startDate > relatedAgendas[0].agendaActivity.startDate
      ) {
        // this subcase has been retraced AND placed on a new agenda after retracting.
        // in that case, the second meeting will be earlier and should be shown instead
        recordToUse = relatedAgendas[1];
      }
      // The latest meeting is visible to the current user
      // We can just fetch it using the store and use the real records
      const meeting = await this.store.findRecord('meeting', recordToUse.meeting.id);
      const agenda = await this.store.findRecord('agenda', recordToUse.agenda.id);
      const agendaitem = await this.store.findRecord('agendaitem', recordToUse.agendaitem.id);
      this.latestMeetingModels = { meeting, agenda, agendaitem };
    } else {
      // The latest meeting is not visible, we should display it but not as a link
      // TODO: if retracted and placed on an earlier meeting, we are not always showing the correct link to the most recent agenda activity
      const visibleRecord = relatedAgendas.find((record) => record.visible);

      // At least one meeting must be visible to the user to display
      // If no meeting is yet propagated, we also don't show the unpropagated one
      if (visibleRecord) {
        const meeting = await this.store.findRecord('meeting', visibleRecord.meeting.id);
        const agenda = await this.store.findRecord('agenda', visibleRecord.agenda.id);
        const agendaitem = await this.store.findRecord('agendaitem', visibleRecord.agendaitem.id);
        this.latestMeetingModels = { meeting, agenda, agendaitem };
      }
      // if the record is not visible, it could be because the latest record is designAgenda.
      // It is possible an earlier version of the record is visible, but we have to get that manually
      const agendaitem = await this.store.queryOne('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': this.args.subcase.id, 
        'filter[agenda][created-for][:id:]': lastRecord.meeting.id,
        'filter[:has-no:next-version]': 't',
        sort: '-agenda-activity.start-date,-created',
      });
      if (agendaitem) {
        // we found an approved agendaitem on the meeting
        const agenda = await agendaitem.agenda;
        this.postponedMeetingModels = null;
        const meeting = await this.store.findRecord('meeting', lastRecord.meeting.id);
        this.latestMeetingModels = { meeting, agenda, agendaitem };
        // the next part is only in case of retracted/resubmit on earlier meetings, a rare case
        if (
          relatedAgendas.length > 1 &&
          lastRecord.decisionResultCode?.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN &&
          relatedAgendas[1].agendaActivity.startDate > relatedAgendas[0].agendaActivity.startDate
        ) {
          // more like retractedMeetingModels in this case
          this.postponedMeetingModels =  {
            meeting: relatedAgendas[1].meeting,
            agenda: relatedAgendas[1].agenda,
            agendaitem: relatedAgendas[1].agendaitem
          };
        }
      } else {
        // the agendaitem is not approved yet for this profile but should show
        this.postponedMeetingModels =  {
          meeting: lastRecord.meeting,
          agenda: lastRecord.agenda,
          agendaitem: lastRecord.agendaitem
        };
      }
    }
    this.latestDecisionActivity = await this.subcaseService.getLatestDecisionActivity(this.args.subcase);
  });
}
