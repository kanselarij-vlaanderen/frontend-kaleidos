import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default class CaseRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model() {
    const parentHash = this.modelFor('publications.publication');
    const publicationFlow = parentHash.publicationFlow;
    const _case = await publicationFlow.get('case');
    return hash({
      publicationFlow,
      case: _case,
      refreshAction: parentHash.refreshAction,
    });
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const parentHash = this.modelFor('publications.publication');
    const publicationFlow = parentHash.publicationFlow;
    const contactPersons = await publicationFlow.get('contactPersons');
    const subcasesOnMeeting = await this.store.query('subcase', {
      filter: {
        case: {
          id: model.id,
        },
        ':has:agenda-activities': 'yes',
      },
      sort: '-created',
      include: 'mandatees',
    });
    if (subcasesOnMeeting) {
      controller.set('latestSubcaseOnMeeting', subcasesOnMeeting.get('firstObject'));
    }
    controller.set('contactPersons', contactPersons);
    controller.set('publicationFlow', publicationFlow);
  }
}
