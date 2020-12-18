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

    // TODO: Dit covered nog niet alle requests die niet open staan..
    //  hier dient ook gefiltered te worden op withdrawn status
    //  maar hiervoor dient status een relatie te zijn ipv rechtstreeks op het model
    const closedOrWithdrawnTranslationRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.vertalen.id,
      'filter[status]': 'closed',
    });

    const totalPublishPreviewRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.drukproeven.id,
    });

    // TODO: Dit covered nog niet alle requests die niet open staan..
    //  hier dient ook gefiltered te worden op withdrawn status
    //  maar hiervoor dient status een relatie te zijn ipv rechtstreeks op het model
    const closedOrWithdrawnPublishPrevieuwRequests = await this.store.query('activity', {
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.drukproeven.id,
      'filter[status]': 'closed',
    });

    return hash({
      publicationFlow,
      counts: {
        totalTranslations: totalTranslations.length,
        closedOrWithdrawnTranslationRequests: closedOrWithdrawnTranslationRequests.length,
        totalPublishPreviewRequests: totalPublishPreviewRequests.length,
        closedOrWithdrawnPublishPrevieuwRequests: closedOrWithdrawnPublishPrevieuwRequests.length,
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
