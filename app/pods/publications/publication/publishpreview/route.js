import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import CONFIG from 'fe-redpencil/utils/config';
import { hash } from 'rsvp';

export default class PublicationPublishPreviewRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model() {
    const parentHash = this.modelFor('publications.publication');
    const publicationFlow = parentHash.publicationFlow;
    let _case = await publicationFlow.get('case');
    _case = await this.store.findRecord('case', _case.get('id'), {
      include: 'pieces,pieces.document-container,pieces.document-container.type',
      reload: true,
    });
    const publishPreviewActivities = await this.store.query('activity', {
      include: 'type,subcase,used-pieces,published-by,publishes',
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.drukproeven.id,
      sort: '-start-date',
    });

    return hash({
      publicationFlow,
      case: _case,
      publishPreviewActivities: publishPreviewActivities,
      refreshAction: parentHash.refreshAction,
    });
  }
}
