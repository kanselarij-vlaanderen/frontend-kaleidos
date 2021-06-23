import Route from '@ember/routing/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { action } from '@ember/object';

export default class AgendaDocumentsRoute extends Route {
  async model() {
    const meeting = this.modelFor('agenda').meeting;
    let pieces = await this.store.query('piece', {
      'filter[meeting][:id:]': meeting.id,
      'page[size]': CONSTANTS.MAX_PAGE_SIZES.PIECES, // TODO add pagination when sorting is done in the backend
      include: 'document-container',
    });
    pieces = pieces.toArray();
    return sortPieces(pieces);
  }

  async afterModel() {
    this.defaultAccessLevel = await this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);
  }

  setupController(controller) {
    super.setupController(...arguments);
    const meeting = this.modelFor('agenda').meeting;
    controller.set('meeting', meeting);
    controller.set('defaultAccessLevel', this.defaultAccessLevel);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
