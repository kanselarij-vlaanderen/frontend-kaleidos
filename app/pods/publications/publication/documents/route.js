import Route from '@ember/routing/route';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class PublicationsPublicationDocumentsRoute extends Route {
  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    const case_ = await model.case;
    const subcase = await this.store.queryOne('subcase', {
      filter: {
        case: {
          [':id:']: case_.id,
        },
        ':has:agenda-activities': 'yes',
      },
    });
    this.isViaCouncilOfMinisters = !!subcase;
  }

  async modelDocument() {
    const parentParams = this.paramsFor('publications.publication');
    const pieces = await this.store.query('piece', {
      'filter[publication-flow][:id:]': parentParams.publication_id,
      // TODO: paginatie uitklaren in design
      'page[size]': PAGE_SIZE.PUBLICATION_FLOW_PIECES,
      include: 'document-container',
    });
    return pieces.toArray();
  }
}
