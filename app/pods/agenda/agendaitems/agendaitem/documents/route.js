import Route from '@ember/routing/route';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import VrNotulenName,
{ compareFunction as compareNotulen } from 'frontend-kaleidos/utils/vr-notulen-name';

export default class DocumentsAgendaitemAgendaitemsAgendaRoute extends Route {
  async model() {
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    let pieces = await this.store.query('piece', {
      'filter[agendaitems][:id:]': agendaitem.id,
      'page[size]': 500, // TODO add pagination when sorting is done in the backend
      include: 'document-container',
    });
    pieces = pieces.toArray();
    let sortedPieces;
    if (agendaitem.isApproval) {
      sortedPieces = sortPieces(pieces, VrNotulenName, compareNotulen);
    } else {
      sortedPieces = sortPieces(pieces);
    }

    return {
      pieces: sortedPieces,
      // linkedPieces: this.modelFor('agenda.agendaitems.agendaitem').get('linkedPieces')
    };
  }

  async afterModel() {
    this.defaultAccessLevel = await this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);
  }

  setupController(controller) {
    super.setupController(...arguments);
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaitem', agendaitem);
    controller.set('defaultAccessLevel', this.defaultAccessLevel);
    controller.isEnabledPieceEdit = false;
    controller.isOpenPieceUploadModal = false;
    controller.isOpenPublicationModal = false;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
