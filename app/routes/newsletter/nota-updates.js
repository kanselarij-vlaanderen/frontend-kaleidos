import Route from '@ember/routing/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { later, cancel } from '@ember/runloop';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class NewsletterNotaUpdatesRoute extends Route {
  queryParams = {
    sort: {
      refreshModel: true,
    },
  };

  @service store;

  willDestroy() {
    super.willDestroy(...arguments);
    cancel(this.scheduledRefresh);
  }

  pollModel = task(async () => {
    this.refresh();
  });

  async model(params) {
    const nota = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.NOTA,
    );
    const visienota = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.VISIENOTA,
    );
    const processedNotas = [];
    const newsletterModel = this.modelFor('newsletter');
    const meeting = newsletterModel.meeting;
    const agenda = newsletterModel.agenda;
    const agendaId = agenda.id;
    const meetingId = meeting.id;
    const notas = await this.store.queryAll('piece', {
      'filter[agendaitems][agenda][:id:]': agendaId,
      'filter[agendaitems][type][:uri:]': CONSTANTS.AGENDA_ITEM_TYPES.NOTA,
      'filter[document-container][type][:id:]': [nota.id, visienota.id].join(','),
      'filter[:has:previous-piece]': 'yes', // "Enkel bissen, ter'en, etc" ...
      'filter[:has-no:next-piece]': 'yes', // enkel laatste versie
      'filter[:has:created]': `date-added-for-cache-busting-${new Date().toISOString()}`,
      include: 'agendaitems,file',
      sort: params.sort,
    });
    for (const nota of notas.slice()) { // proxyarray to native JS array
      const agendaitemsLinkedToNota = await nota.get('agendaitems');
      let agendaitemOnLatestAgenda;
      for (let index = 0; index < agendaitemsLinkedToNota.length; index++) {
        const agendaitemToFetch = agendaitemsLinkedToNota.at(index);
        const agendaitemFromStore = await this.store.findRecord('agendaitem', agendaitemToFetch.id,
          {
            reload: true,
          });
        const agendaToCheck = await agendaitemFromStore.get('agenda');
        if (agendaToCheck) {
          if (agendaToCheck.get('id') === agendaId) {
            agendaitemOnLatestAgenda = agendaitemFromStore;
          }
        }
      }
      // don't process postponed/retracted agendaitems
      const decisionActivity = await this.store.queryOne('decision-activity', {
        'filter[treatment][agendaitems][:id:]': agendaitemOnLatestAgenda.id,
      });
      const decisionResultCode = await decisionActivity.decisionResultCode;
      if (
        [
          CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD,
          CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN,
        ].includes(decisionResultCode?.uri)
      ) {
        continue;
      }

      const agendaitemNumber = agendaitemOnLatestAgenda.get('number');
      const agendaitemId = agendaitemOnLatestAgenda.get('id');
      const agendaitemShortTitle = agendaitemOnLatestAgenda.get('shortTitle');
      const pieceData = await this.getPieceData(nota);
      const processedNota = {
        meetingId,
        agendaId,
        agendaitemId,
        agendaitemNumber,
        agendaitemShortTitle,
        ...pieceData,
      };
      processedNotas.push(processedNota);
    }
    this.scheduledRefresh = later(this, () => this.pollModel.perform(), 3 * 60000);
    return processedNotas;
  }

  async getPieceData(piece) {
    const name = piece.name;
    const documentId = piece.id;
    const created = piece.created;
    const modified = piece.modified;
    const accessLevelLastModified = piece.accessLevelLastModified;
    const file = await piece.belongsTo('file').reload();
    const fileCreated = file?.created;
    return {
      documentId,
      name,
      created,
      modified,
      accessLevelLastModified,
      fileCreated,
    };
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
    return true;
  }
}
