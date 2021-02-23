import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default class CaseRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model() {
    const parentHash = this.modelFor('publications.publication');
    const publicationFlow = parentHash.publicationFlow;
    const _case = await publicationFlow.get('case');
    const contactPersons = await publicationFlow.get('contactPersons');
    const organizations = await this.store.query('organization', {});
    return hash({
      publicationFlow,
      case: _case,
      contactPersons: contactPersons,
      refreshAction: parentHash.refreshAction,
      organizations: organizations.toArray(),
    });
  }
  async afterModel(model) {
    model.contactPersons.map((contactperson) => contactperson.get('organizations'));
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const subcasesOnMeeting = await this.store.query('subcase', {
      filter: {
        case: {
          id: model.case.id,
        },
        ':has:agenda-activities': 'yes',
      },
      sort: '-created',
      include: 'mandatees',
    });
    if (subcasesOnMeeting) {
      controller.set('latestSubcaseOnMeeting', subcasesOnMeeting.get('firstObject'));
    }
  }
}
