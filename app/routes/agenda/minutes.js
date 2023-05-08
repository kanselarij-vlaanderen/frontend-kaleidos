import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaMinutesRoute extends Route {
  @service store;

  async model() {
    const meeting = this.modelFor('agenda').meeting;
    return await meeting.minutes;
  }

  setupController(controller) {
    super.setupController(...arguments);
    // const meeting = this.modelFor('agenda').meeting;
    // controller.meeting = meeting;
    // const agenda = this.modelFor('agenda').agenda;
    // controller.agenda = agenda;
    // controller.defaultAccessLevel = this.defaultAccessLevel;
  }
}
