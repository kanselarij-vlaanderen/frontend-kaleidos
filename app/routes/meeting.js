import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MeetingRoute extends Route {
  @service store;
  @service router;

  model(params) {
    this.meetingId = params.meeting_id;
    return this.store.queryOne('agenda', {
      'filter[created-for][:id:]': params.meeting_id,
      sort: '-serialnumber',
      include: 'status',
    });
  }

  afterModel(model) {
    this.router.transitionTo('agenda.agendaitems', this.meetingId, model.id);
  }
}
