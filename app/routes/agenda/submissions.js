import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaSubmissionsRoute extends Route{
  @service store;

  async model() {
    const { meeting } = this.modelFor('agenda');
    const submissions = await this.store.queryAll('submission', {
      'filter[meeting][:id:]': meeting.id,
      include: 'type,status,mandatees.person,mandatees.person.organization,being-treated-by'
    })

    return submissions;
  }

  async setupController() {
    super.setupController(...arguments);
  }

}