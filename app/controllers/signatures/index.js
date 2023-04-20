import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import * as digitalSigning from 'frontend-kaleidos/utils/digital-signing';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class SignaturesIndexController extends Controller {
  @service router;
  @service store;

  queryParams = [
    {
      page: {
        type: 'number',
      },
      size: {
        type: 'number',
      },
      sort: {
        type: 'string',
      },
    },
  ];
  page = 0;
  size = PAGINATION_SIZES[1];

  @tracked signFlow = null;
  @tracked agendaitem = null;
  @tracked agenda = null;
  @tracked meeting = null;
  @tracked showSidebar = false;

  async getAgendaitem(signFlow) {
    const decisionActivity = await signFlow.decisionActivity;
    const treatment = await decisionActivity.treatment;
    const agendaitems = await treatment.agendaitems;
    let latestAgendaitem = null;

    for (let agendaitem of agendaitems.toArray()) {
      const nextVersion = await agendaitem.nextVersion;
      if (!nextVersion) {
        latestAgendaitem = agendaitem;
        break;
      }
    }
    return latestAgendaitem;
  }

  async getAgendaitemRouteModels(signFlow) {
    const agendaitem = await this.getAgendaitem(signFlow);
    if (agendaitem) {
      const agenda = await agendaitem.agenda;
      const meeting = await agenda.meeting;
      return [meeting, agenda, agendaitem];
    }
    return [];
  }

  getMandateeNames = async (signFlow) => {
    const agendaitem = await this.getAgendaitem(signFlow);
    const mandatees = await agendaitem.mandatees;
    const persons = await Promise.all(
      mandatees
        .sortBy('priority')
        .map((mandatee) => mandatee.person)
    );
    return persons.map((person) => person.fullName);
  }

  @action
  async openSidebar(signFlow) {
    this.signFlow = signFlow;
    [
      this.meeting,
      this.agenda,
      this.agendaitem
    ] = await this.getAgendaitemRouteModels(signFlow);
    this.showSidebar = true;
  }

  @action
  closeSidebar() {
    this.signFlow = null;
    this.agendaitem = null;
    this.agenda = null;
    this.meeting = null;
    this.showSidebar = false;
  }

  @action
  changeSorting(sort) {
    this.sort = sort;
  }

  @action
  async navigateToDecision(decisionActivity) {
    const agendaitem = await this.store.queryOne('agendaitem', {
      'filter[treatment][decision-activity][:id:]': decisionActivity.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    const agenda = await agendaitem.get('agenda');
    const meeting = await agenda.get('createdFor');
    this.router.transitionTo(
      'agenda.agendaitems.agendaitem.decisions',
      meeting.id,
      agenda.id,
      agendaitem.id
    );
  }

  @action
  async uploadPiecesToSigninghub(signingFlow) {
    const pieces = [
      await (await (await signingFlow.signSubcase).signMarkingActivity).piece,
    ];
    digitalSigning.uploadPiecesToSigninghub(signingFlow, pieces);
  }

  @action
  async startSigning(signingFlow) {
    digitalSigning.startSigning(signingFlow);
  }
}
