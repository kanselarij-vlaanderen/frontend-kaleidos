import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class PublicationRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model(params) {
    const publicationFlow = await this.store.findRecord('publication-flow', params.publication_id, {
      include: 'case,status,mode,regulation-type,contact-persons,numac-numbers',
      reload: true,
    });

    return publicationFlow;
  }

  async afterModel(model) {
    const lastestSubcaseOnMeeting = this.store.query('subcase', {
      filter: {
        case: {
          // cannot access yet without get(...)
          id: model.case.get('id'),
        },
        ':has:agenda-activities': 'yes',
      },
      sort: '-created',
      include: 'mandatees',
    }).then((subcase) =>
    subcase.firstObject);

    const publicationStatusPromise = this.store.query('publication-status', {});
    const regulationTypePromise = this.store.query('regulation-type', {});

    const [latestSubcaseOnMeeting] = await Promise.all([lastestSubcaseOnMeeting, publicationStatusPromise, regulationTypePromise]);

    this.latestSubcaseOnMeeting = latestSubcaseOnMeeting;
  }

  setupController(controller) {
    super.setupController(...arguments);

    controller.latestSubcaseOnMeeting = this.latestSubcaseOnMeeting;
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
