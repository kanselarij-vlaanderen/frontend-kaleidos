import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { action } from '@ember/object';

export default class PublicationRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model(params) {
    const publicationFlow = await this.store.findRecord('publication-flow', params.publication_id, {
      include: 'case,status,mode,regulation-type,contact-persons,numac-numbers',
      reload: true,
    });
    await publicationFlow.get('regulationType');
    const _case = await publicationFlow.get('case');

    const subcasesOnMeeting = await this.store.query('subcase', {
      filter: {
        case: {
          id: _case.id,
        },
        ':has:agenda-activities': 'yes',
      },
      sort: '-created',
      include: 'mandatees',
    });

    const regulationTypes = this.store.query('regulation-type', {
      sort: 'position', 'page[size]': 50,
    });

    // cached in publications route
    const publicationModes = this.store.peekAll('publication-mode').sortBy('position');

    return hash({
      publicationFlow,
      regulationTypes,
      publicationModes,
      latestSubcaseOnMeeting: subcasesOnMeeting.get('firstObject'),
      case: _case,
      refreshAction: this.refreshModel,
    });
  }

  async afterModel(model) {
    this.urgencyLevel = await model.publicationFlow.urgencyLevel;
    await this.store.query('publication-status', {});
    this.publicationStatus = await model.publicationFlow.status;
  }

  /* eslint-disable id-length,no-unused-vars */
  resetController(controller, _, transition) {
    controller.publicationNotAfterTranslationForPublication = false;
    controller.publicationNotAfterTranslationForTranslation = false;
    controller.numberIsAlreadyUsed = false;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.urgencyLevel = this.urgencyLevel;
    controller.publicationStatus = this.publicationStatus;
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
