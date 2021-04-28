import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class PublicationRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model(params) {
    const publicationFlow = await this.store.findRecord('publication-flow', params.publication_id, {
      include: 'case,status,mode,regulation-type,contact-persons,numac-numbers',
      reload: true,
    });
    await publicationFlow.get('case');

    return publicationFlow;
  }

  async afterModel(model) {
    const subcasesOnMeetingPromise = this.store.query('subcase', {
      filter: {
        case: {
          // cannot access yet without get(...)
          id: model.case.get('id'),
        },
        ':has:agenda-activities': 'yes',
      },
      sort: '-created',
      include: 'mandatees',
    });

    const publicationStatusPromise = this.store.query('publication-status', {});
    const regulationTypePromise = this.store.query('regulation-type', {});

    const [subcasesOnMeeting] = await Promise.all([subcasesOnMeetingPromise, publicationStatusPromise, regulationTypePromise]);

    this.subcasesOnMeeting = subcasesOnMeeting;
  }

  setupController(controller) {
    super.setupController(...arguments);

    controller.subcasesOnMeeting = this.subcasesOnMeeting;
  }

  /* eslint-disable id-length,no-unused-vars */
  resetController(controller, _, transition) {
    controller.publicationNotAfterTranslationForPublication = false;
    controller.publicationNotAfterTranslationForTranslation = false;
  }

  // actions in routers are "fall through":
  //  they can be called using sent in controllers of subroutes
  @action
  refreshPublicationFlow() {
    this.refresh();
  }
}
