import Route from '@ember/routing/route';
import { animationFrame } from 'ember-concurrency';

export default class AgendaAgendaitemsIndexRoute extends Route {
  async setupController() {
    super.setupController(...arguments);
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const parentController = this.controllerFor('agenda.agendaitems');
    // Covering the case where the user start directly on an agendaitem detail route (agenda.agendaitems.agendaitem.xxx)
    // Navigating from there to the agendaitems index route doesn't pass through
    // setupController of agenda.agendaitems route, hence documents will not be loaded yet.
    if (parentController.loadDocuments.performCount === 0) {
      await parentController.loadDocuments.perform();
    }
    await animationFrame(); // make sure rendering has happened before trying to scroll
    parentController.scrollToAnchor();
  }
}
