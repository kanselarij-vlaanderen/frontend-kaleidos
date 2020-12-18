import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import CONFIG from 'fe-redpencil/utils/config';
import { action } from '@ember/object';

export default class PublicationRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model(params) {
    const publicationFlow = await this.store.findRecord('publication-flow', params.publication_id, {
      reload: true,
    }, {
      include: 'case,contact-person,status,type',
    });

    const totalTranslations = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.vertalen.id,
    });
    const openTranslationRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.vertalen.id,
      'filter[status]': 'closed',
    });

    const totalPublishPreviewRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.drukproeven.id,
    });
    const openPublishPrevieuwRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.drukproeven.id,
      'filter[status]': 'closed',
    });

    return hash({
      publicationFlow,
      counts: {
        totalTranslations: totalTranslations.length,
        openTranslationRequests: openTranslationRequests.length,
        totalPublishPreviewRequests: totalPublishPreviewRequests.length,
        openPublishPrevieuwRequests: openPublishPrevieuwRequests.length,
      },
      refreshAction: this.refreshModel,
    });
  }

  /* eslint-disable id-length,no-unused-vars */
  resetController(controller, _, transition) {
    controller.publicationNotAfterTranslationForPublication = false;
    controller.publicationNotAfterTranslationForTranslation = false;
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
