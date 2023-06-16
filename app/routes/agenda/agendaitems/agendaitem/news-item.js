import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class NewsitemAgendaitemAgendaitemsAgendaRoute extends Route {
  @service router;
  @service store;
  @service toaster;
  @service intl;

  async beforeModel() {
    // Check if a treatment exists, otherwise redirect gracefully.
    // This should only happen with corrupt data.
    this.agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    this.agendaItemTreatment = await this.agendaitem.treatment;
    if (!this.agendaItemTreatment) {
      warn(`Agenda item "${this.agendaitem.id}" is missing a treatment`, {
        id: 'broken-data.missing-agenda-item-treatment',
      });
      this.router.transitionTo('agenda.agendaitems.agendaitem.index');
    }
  }

  model() {
    return this.store.queryOne('news-item', {
      'filter[agenda-item-treatment][:id:]': this.agendaItemTreatment.id,
      include: 'themes',
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
    // It is possible to concurrently create multiple newsItems
    // While searching for a proper fix, we inform the users of this problem
    const hasMultipleNewsItems = (await this.store.count('news-item', {
      'filter[agenda-item-treatment][:id:]': this.agendaItemTreatment.id,
    })) > 1;
    if (hasMultipleNewsItems) {
      this.toaster.error(
        this.intl.t('error-multiple-newsitem'),
        this.intl.t('warning-title')
      );
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.isEditing = false;
    controller.isFullscreen = false;
    controller.hideNotaModificationWarning = false;
    controller.agendaitem = this.agendaitem;
    controller.notaModifiedTime = this.notaModifiedTime;
  }
}
