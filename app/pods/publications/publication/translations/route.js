import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default class PublicationTranslationRoute extends Route {
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
    const translationActivities = await this.store.query('translation-activity', {
      include: 'subcase,used-pieces',
      'filter[subcase][publication-flow][:id:]': publicationFlow.id,
      sort: '-start-date',
    });

    return hash({
      publicationFlow,
      case: _case,
      translationActivities: translationActivities,
      refreshAction: parentHash.refreshAction,
    });
  }
}
