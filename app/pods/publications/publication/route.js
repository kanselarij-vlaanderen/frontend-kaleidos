import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class PublicationRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model(params) {
    const publicationFlow = await this.store.findRecord('publication-flow', params.publication_id, {
      include: 'case,status,mode,regulation-type,contact-persons,numac-numbers,identification',
      reload: true,
    });

    return publicationFlow;
  }

  async afterModel(model) {
    const latestSubcaseOnMeetingPromise = this.store.queryOne('subcase', {
      filter: {
        case: {
          // cannot access yet without get(...)
          [':id:']: model.case.get('id'),
        },
        ':has:agenda-activities': 'yes',
      },
      sort: '-created',
      include: 'mandatees',
    });

    const publicationStatusPromise = this.store.query('publication-status', {});
    const regulationTypePromise = this.store.query('regulation-type', {});

    const [latestSubcaseOnMeeting] = await RSVP.all([latestSubcaseOnMeetingPromise, publicationStatusPromise, regulationTypePromise]);

    this.latestSubcaseOnMeeting = latestSubcaseOnMeeting;
  }

  setupController(controller) {
    super.setupController(...arguments);

    controller.latestSubcaseOnMeeting = this.latestSubcaseOnMeeting;
  }
}
