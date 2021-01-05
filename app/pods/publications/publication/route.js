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
    const closedTranslationRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.vertalen.id,
      'filter[status][:id:]': CONFIG.ACTIVITY_STATUSSES.closed.id,
    });
    const withdrawnTranslationRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.vertalen.id,
      'filter[status][:id:]': CONFIG.ACTIVITY_STATUSSES.withdrawn.id,
    });
    const totalPublishPreviewRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.drukproeven.id,
    });
    const withdrawnPublishPreviewRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.drukproeven.id,
      'filter[status][:id:]': CONFIG.ACTIVITY_STATUSSES.withdrawn.id,
    });
    const closedPublishPreviewRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.drukproeven.id,
      'filter[status][:id:]': CONFIG.ACTIVITY_STATUSSES.closed.id,
    });

    return hash({
      publicationFlow,
      counts: {
        totalTranslations: totalTranslations.length,
        closedOrWithdrawnTranslationRequests: closedTranslationRequests.length + withdrawnTranslationRequests.length,
        totalPublishPreviewRequests: totalPublishPreviewRequests.length,
        closedOrWithdrawnPublishPrevieuwRequests: closedPublishPreviewRequests.length + withdrawnPublishPreviewRequests.length,
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
