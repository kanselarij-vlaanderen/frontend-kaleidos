import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default class PublicationDocumentsRoute extends Route {
  async model() {
    const parentHash = this.modelFor('publications.publication');
    const publicationFlow = parentHash.publicationFlow;
    const _case = await publicationFlow.get('case');
    const caze = await this.store.findRecord('case', _case.get('id'), {
      include: 'pieces,pieces.document-container,pieces.document-container.type',
      reload: true,
    });

    return hash({
      publicationFlow,
      case: caze,
      refreshAction: parentHash.refreshAction,
    });
  }

  /* eslint-disable id-length,no-unused-vars */
  resetController(controller, _, transition) {
    controller.reset();
  }
}
