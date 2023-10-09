import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesSubcaseIndexRoute extends Route {
  @service store;

  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
  };

  beforeModel() {
    this.decisionmakingFlow = this.modelFor('cases.case');
  }

  async model(params) {
    const subcase = this.modelFor('cases.case.subcases.subcase');
    // For showing the history of subcases within this route, we need a list of subcases without the current model
    //  We want to sort descending on date the subcase was concluded.
    //  In practice, reverse sorting on created will be close
    const siblingSubcases = await this.store.query('subcase', {
      'filter[decisionmaking-flow][:id:]': this.decisionmakingFlow.id,
      page: {
        number: params.page,
        size: params.size,
      },
      sort: '-created',
    });

    return {
      subcase,
      siblingSubcases,
    };
  }

  async afterModel(model) {
    this.mandatees = (await model.subcase.mandatees).slice().sort((m1, m2) => m1.priority - m2.priority);
    this.submitter = await model.subcase.requestedBy;
    const agendaActivities = await model.subcase.agendaActivities;
    const latestActivity = agendaActivities.slice().sort((a1, a2) => a1.startDate - a2.startDate).at(-1);
    if (latestActivity) {
      this.meeting = await this.store.queryOne('meeting', {
        'filter[agendas][agendaitems][agenda-activity][:id:]': latestActivity.id,
        sort: '-planned-start',
      });
      this.agenda = await this.meeting?.belongsTo('agenda').reload();
    }
    await model.subcase.governmentAreas;
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.mandatees = this.mandatees;
    controller.submitter = this.submitter;
    controller.decisionmakingFlow = this.decisionmakingFlow;
    controller.meeting = this.meeting;
    controller.agenda = this.agenda;
    controller.governmentAreas = this.governmentAreas;
  }
}
