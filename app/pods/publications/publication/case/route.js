import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class CaseRoute extends Route {
  async model() {
    return this.modelFor('publications.publication').case;
  }

  async afterModel(model) {
    this.publicationFlow = this.modelFor('publications.publication');
    this.contactPersons = this.publicationFlow.contactPersons;

    const latestSubcaseOnMeetingPromise = this.store.query('subcase', {
      filter: {
        case: {
          // cannot access yet without get(...)
          id: model.get('id'),
        },
        ':has:agenda-activities': 'yes',
      },
      sort: '-created',
      include: 'mandatees',
    }).then((subcase) => subcase.firstObject);

    // TODO This is not ideal, there are currently +- 60 organizations that come from ACM-IDM, they don't have a name
    // TODO need a better filter, add a boolean to model maybe ?
    const organizationsPromise = this.store.query('organization', {
      page: {
        size: 200,
      },
    }).then((organizations) => organizations.filter((org) => org.name));

    const [organizations, latestSubcaseOnMeeting] = await RSVP.all([organizationsPromise, latestSubcaseOnMeetingPromise]);
    this.organizations = organizations;
    this.latestSubcaseOnMeeting = latestSubcaseOnMeeting;
  }

  async setupController(controller) {
    super.setupController(...arguments);

    controller.publicationFlow = this.publicationFlow;
    controller.contactPersons = this.contactPersons;
    controller.latestSubcaseOnMeeting = this.latestSubcaseOnMeeting;
    controller.organizations = this.organizations;
  }
}
