import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default class PublicationDocumentsRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model() {
    const publicationFlow = this.modelFor('publications.publication');
    const _case = await publicationFlow.get('case');

    const caze = await this.store.findRecord('case', _case.get('id'), {
      include: 'pieces,pieces.document-container,pieces.document-container.type',
      reload: true,
    });

    const subcaseids = await publicationFlow.get('subcase');
    const subcases = await this.store.query('subcase', {
      'filter[:id:]': subcaseids,
      include: 'activity',
    });

    return hash({
      publicationFlow,
      case: caze,
      subcases: subcases,
    });
  }
}
