import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default class PublicationPublishPreviewRoute extends Route {
  async model() {
    const parentHash = this.modelFor('publications.publication');
    const publicationFlow = parentHash.publicationFlow;
    let _case = await publicationFlow.get('case');
    _case = await this.store.findRecord('case', _case.get('id'), {
      include: 'pieces,pieces.document-container,pieces.document-container.type',
      reload: true,
    });
    const publishPreviewActivities = await this.store.query('proofing-activity', {
      include: 'subcase,used-pieces,generated-pieces',
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
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
