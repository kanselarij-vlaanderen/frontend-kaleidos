import Route from '@ember/routing/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { inject as service } from '@ember/service';

export default class AgendaDocumentsRoute extends Route {
  @service store;

  async model() {
    const meeting = this.modelFor('agenda').meeting;
    let pieces = await this.store.queryAll('piece', {
      'filter[meeting][:id:]': meeting.id,
      include: 'document-container',
    });
    pieces = pieces.slice();
    return sortPieces(pieces);
  }

  async afterModel() {
    this.defaultAccessLevel = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);
  }

  setupController(controller) {
    super.setupController(...arguments);
    const meeting = this.modelFor('agenda').meeting;
    controller.meeting = meeting;
    const agenda = this.modelFor('agenda').agenda;
    controller.agenda = agenda;
    controller.defaultAccessLevel = this.defaultAccessLevel;
  }
}
