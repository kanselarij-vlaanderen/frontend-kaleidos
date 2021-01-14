import Route from '@ember/routing/route';
import config from 'fe-redpencil/utils/config';
import { action } from '@ember/object';
import VRDocumentName, { compareFunction as compareDocuments } from 'fe-redpencil/utils/vr-document-name';

export default class DocumentsSubcaseSubcasesRoute extends Route {
  async model() {
    const subcase = this.modelFor('cases.case.subcases.subcase');
    let pieces = await this.store.query('piece', {
      'filter[subcase][:id:]': subcase.id,
      'page[size]': 500 // TODO add pagination when sorting is done in the backend
    });
    pieces = pieces.toArray();
    const sortedPieces = pieces.sort((docA, docB) => compareDocuments(new VRDocumentName(docA.name), new VRDocumentName(docB.name)));
    return {
      pieces: sortedPieces,
      // linkedPieces: this.modelFor('cases.case.subcases.subcase').get('linkedPieces')
    };
  }

  async afterModel() {
    this.defaultAccessLevel = this.store.peekRecord('access-level', config.internRegeringAccessLevelId);
    if (!this.defaultAccessLevel) {
      const accessLevels = await this.store.query('access-level', {
        'page[size]': 1,
        'filter[:id:]': config.internRegeringAccessLevelId,
      });
      this.defaultAccessLevel = accessLevels.firstObject;
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    const subcase = this.modelFor('cases.case.subcases.subcase');
    controller.set('subcase', subcase);
    controller.set('defaultAccessLevel', this.defaultAccessLevel);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
