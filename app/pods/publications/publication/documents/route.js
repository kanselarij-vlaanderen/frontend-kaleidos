import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { A } from '@ember/array';

export default class PublicationDocumentsRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model() {
    const publicationFlow = this.modelFor('publications.publication');
    const _case = await publicationFlow.get('case');
    const caze = await this.store.findRecord('case', _case.get('id'), {
      include: 'pieces,pieces.document-container,pieces.document-container.type',
      reload: true,
    });
    return hash({
      publicationFlow,
      case: caze,
    });
  }

  /* eslint-disable id-length,no-unused-vars */
  resetController(controller, _, transition) {
    controller.selectedPieces = A([]);
    controller.renderPieces = true;
  }
}
