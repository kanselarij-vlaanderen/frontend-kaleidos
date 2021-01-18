import Route from '@ember/routing/route';
import config from 'fe-redpencil/utils/config';
import { sortPieces } from 'fe-redpencil/utils/documents';
import { action } from '@ember/object';

export default class AgendaDocumentsRoute extends Route {
  async model() {
    const meeting = this.modelFor('agenda').meeting;
    let pieces = await this.store.query('piece', {
      'filter[meeting][:id:]': meeting.id,
      'page[size]': 500, // TODO add pagination when sorting is done in the backend
    });
    pieces = pieces.toArray();
    return sortPieces(pieces);
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
    const meeting = this.modelFor('agenda').meeting;
    controller.set('meeting', meeting);
    controller.set('defaultAccessLevel', this.defaultAccessLevel);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
