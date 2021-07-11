import Route from '@ember/routing/route';
import { animationFrame } from 'ember-concurrency';

export default class AgendaAgendaitemsIndexRoute extends Route {
  async setupController() {
    super.setupController(...arguments);

    const agendaitemsOverviewController = this.controllerFor('agenda.agendaitems');
    // Covering the case where the user start directly on an agendaitem detail route (agenda.agendaitems.agendaitem.xxx)
    // Navigating from there to the agendaitems index route doesn't pass through
    // setupController of agenda.agendaitems route, hence documents will not be loaded yet.
    if (agendaitemsOverviewController.loadDocuments.performCount === 0) {
      await agendaitemsOverviewController.loadDocuments.perform();
      await animationFrame(); // make sure rendering has happened before trying to scroll
      agendaitemsOverviewController.scrollToAnchor();
    }
  }
}
