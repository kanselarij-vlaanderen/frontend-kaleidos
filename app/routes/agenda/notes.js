import Route from '@ember/routing/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { inject as service } from '@ember/service';

export default class AgendaNotesRoute extends Route {
  @service store;

  async model() {
    // const meeting = this.modelFor('agenda').meeting;
    // let pieces = await this.store.query('piece', {
    //   'filter[meeting][:id:]': meeting.id,
    //   'page[size]': PAGE_SIZE.PIECES, // TODO add pagination when sorting is done in the backend
    //   include: 'document-container',
    // });
    // pieces = pieces.toArray();
    // return sortPieces(pieces);
  }

  async afterModel() {
    // this.defaultAccessLevel = await this.store.findRecordByUri(
    //   'concept',
    //   CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    // );
  }

  setupController(controller) {
    super.setupController(...arguments);
    // const meeting = this.modelFor('agenda').meeting;
    // controller.meeting = meeting;
    // const agenda = this.modelFor('agenda').agenda;
    // controller.agenda = agenda;
    // controller.defaultAccessLevel = this.defaultAccessLevel;
  }
}
