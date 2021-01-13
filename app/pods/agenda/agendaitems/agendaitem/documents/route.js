import Route from '@ember/routing/route';
import config from 'fe-redpencil/utils/config';
import { action } from '@ember/object';
import VRDocumentName, { compareFunction as compareDocuments } from 'fe-redpencil/utils/vr-document-name';

export default class DocumentsAgendaitemAgendaitemsAgendaRoute extends Route {
  async model() {
    let pieces = await this.modelFor('agenda.agendaitems.agendaitem').pieces; // TODO: ember-data cache doesn't update this array in case an element get removed
    pieces = pieces.toArray();
    const sortedPieces = pieces.sort((docA, docB) => compareDocuments(new VRDocumentName(docA.name), new VRDocumentName(docB.name)));
    return {
      pieces: sortedPieces,
      // linkedPieces: this.modelFor('agenda.agendaitems.agendaitem').get('linkedPieces')
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
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaitem', agendaitem);
    controller.set('defaultAccessLevel', this.defaultAccessLevel);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
