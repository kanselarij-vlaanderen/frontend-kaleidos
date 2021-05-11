import Route from '@ember/routing/route';
import CONFIG from 'frontend-kaleidos/utils/config';
import { hash } from 'rsvp';

export default class PublicationPublishPreviewRoute extends Route {
  beforeModel(transition) {
    alert('Not implemented yet.');
    transition.abort();
  }

  async model() {
    const parentHash = this.modelFor('publications.publication');
    const publicationFlow = parentHash.publicationFlow;
    let _case = await publicationFlow.get('case');
    _case = await this.store.findRecord('case', _case.get('id'), {
      include: 'pieces,pieces.document-container,pieces.document-container.type',
      reload: true,
    });
    const publishPreviewActivities = await this.store.query('activity', {
      include: 'type,subcase,used-pieces,generated-pieces,published-by,publishes',
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
