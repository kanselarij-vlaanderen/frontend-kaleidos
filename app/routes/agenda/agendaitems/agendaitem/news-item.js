import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class NewsitemAgendaitemAgendaitemsAgendaRoute extends Route {
  @service store;

  async beforeModel() {
    // Check if a treatment exists, otherwise redirect gracefully.
    // This should only happen with corrupt data.
    this.agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    this.agendaItemTreatment = await this.agendaitem.treatment;
    if (!this.agendaItemTreatment) {
      warn(`Agenda item "${this.agendaitem.id}" is missing a treatment`, {
        id: 'broken-data.missing-agenda-item-treatment',
      });
      this.transitionTo('agenda.agendaitems.agendaitem.index');
    }
  }

  model() {
    return this.store.queryOne('newsletter-info', {
      'filter[agenda-item-treatment][:id:]': this.agendaItemTreatment.id,
    });
  }

  async afterModel() {
    // Get most recent version of document with type 'Nota',
    // but only if there are multiple versions of the document
    const latestNotaVersion = await this.store.queryOne('piece', {
      filter: {
        agendaitems: {
          ':id:': this.agendaitem.id
        },
        'document-container': {
          type: {
            ':uri:': CONSTANTS.DOCUMENT_TYPES.NOTA,
          },
        },
        ':has-no:next-piece': 'yes',
        ':has:previous-piece': 'yes',
      }
    });

    this.notaModifiedTime = latestNotaVersion?.created;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.isEditing = false;
    controller.isFullscreen = false;
    controller.hideNotaModificationWarning = false;
    controller.agendaitem = this.agendaitem;
    controller.notaModifiedTime = this.notaModifiedTime;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
