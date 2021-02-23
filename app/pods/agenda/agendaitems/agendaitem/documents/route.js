import Route from '@ember/routing/route';
import config from 'frontend-kaleidos/utils/config';
import { action } from '@ember/object';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

export default class DocumentsAgendaitemAgendaitemsAgendaRoute extends Route {
  async model() {
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    let pieces = await this.store.query('piece', {
      'filter[agendaitems][:id:]': agendaitem.id,
      'page[size]': 500, // TODO add pagination when sorting is done in the backend
      include: 'document-container',
    });
    pieces = pieces.toArray();

    const sortedPieces = sortPieces(pieces);
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
