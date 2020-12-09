import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import CONFIG from 'fe-redpencil/utils/config';
import { hash } from 'rsvp';

export default class PublicationPublishPreviewRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model() {
    const publicationFlow = this.modelFor('publications.publication');
    let _case = await publicationFlow.get('case');
    _case = await this.store.findRecord('case', _case.get('id'), {
      include: 'pieces,pieces.document-container,pieces.document-container.type',
      reload: true,
    });
    const publishPreviewActivities = await this.store.query('activity', {
      include: 'type,subcase,used-pieces',
      'filter[subcase][publication-flow][:id:]': publicationFlow.get('id'),
      'filter[type][:id:]': CONFIG.ACTIVITY_TYPES.drukproeven.id,
    });

    return hash({
      publicationFlow,
      case: _case,
      publishPreviewActivities: publishPreviewActivities,
    });
  }
}
