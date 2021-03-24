import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default class CaseRoute extends Route {
  async model() {
    const parentHash = this.modelFor('publications.publication');
    const publicationFlow = parentHash.publicationFlow;
    const _case = await publicationFlow.get('case');
    const contactPersons = await publicationFlow.get('contactPersons');
    // TODO This is not ideal, there are currently +- 60 organizations that come from ACM-IDM, they don't have a name
    // TODO need a better filter, add a boolean to model maybe ?
    const organizations = await this.store.query('organization', {
      page: {
        size: 200,
      },
    });
    const filteredOrganizations = organizations.filter((orgs) => orgs.name);
    return hash({
      publicationFlow,
      case: _case,
      contactPersons: contactPersons,
      refreshAction: parentHash.refreshAction,
      organizations: filteredOrganizations.toArray(),
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
