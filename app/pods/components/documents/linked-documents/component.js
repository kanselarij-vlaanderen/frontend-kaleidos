import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';
import config from 'frontend-kaleidos/utils/config';

export default class DocumentsLinkedDocumentsComponent extends Component {
  @service currentSession;
  @service store;

  @tracked isOpenLinkedPieceModal = false;
  @tracked linkedPieces = A([]);
  @tracked newLinkedPieces = A([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.linkedPieces = yield this.args.agendaitemOrSubcase.linkedPieces;
  }

  get itemType() {
    return this.args.agendaitemOrSubcase && this.args.agendaitemOrSubcase.constructor.modelName;
  }

  @action
  openLinkedPieceModal() {
    this.isOpenLinkedPieceModal = true;
  }

  @action
  cancelLinkPieces() {
    this.newLinkedPieces = A([]);
    this.isOpenLinkedPieceModal = false;
  }

  @action
  linkPiece(piece) {
    this.newLinkedPieces.pushObject(piece);
  }

  @action
  unlinkPiece(piece) {
    this.newLinkedPieces.removeObject(piece);
  }

  @task
  *saveLinkedPieces() {
    let allPiecesToLink = [];
    for (const linkedPiece of this.newLinkedPieces) {
      const linkedPieces = yield this.store.query('piece', {
        'filter[document-container][pieces][:id:]': linkedPiece.get('id'),
        page: {
          size: 300,
        },
      });
      allPiecesToLink = [...allPiecesToLink, ...linkedPieces.toArray()];
    }

    if (allPiecesToLink.length) {
      if (this.itemType === 'agendaitem') {
        // Link pieces to subcase related to the agendaitem
        const agendaActivity = yield this.args.agendaitemOrSubcase.agendaActivity;
        if (agendaActivity) {
          const subcase = yield agendaActivity.subcase;
          const currentSubcaseLinkedPieces = yield subcase.hasMany('linkedPieces').reload();
          const subcasePieces = currentSubcaseLinkedPieces.pushObjects(allPiecesToLink);
          subcase.set('linkedPieces', subcasePieces);
          yield subcase.save();
        }
      } else if (this.itemType === 'subcase') {
        // Link pieces to all agendaitems that are related to the subcase via an agendaActivity
        // and related to an agenda in the design status
        const agendaitems = yield this.store.query('agendaitem', {
          'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
          'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id,
        });
        const agendaitemUpdates = agendaitems.map(async(agendaitem) => {
          const currentAgendaitemLinkedPieces = await agendaitem.hasMany('linkedPieces').reload();
          const agendaitempieces = currentAgendaitemLinkedPieces.pushObjects(allPiecesToLink);
          agendaitem.set('linkedPieces', agendaitempieces);
          await agendaitem.save();
        });
        yield all(agendaitemUpdates);
      }

      // Link pieces to subcase/agendaitem
      const currentLinkedPieces = yield this.args.agendaitemOrSubcase.hasMany('linkedPieces').reload();
      const newLinkedpieces = currentLinkedPieces.pushObjects(allPiecesToLink);
      this.args.agendaitemOrSubcase.set('linkedPieces', newLinkedpieces);
      yield this.args.agendaitemOrSubcase.save();
      this.linkedPieces = newLinkedpieces;
    }

    this.newLinkedPieces = A([]);
    this.isOpenLinkedPieceModal = false;
  }

  @task
  *unlinkDocumentContainer(documentContainer) {
    const linkedPiecesToRemove = (yield documentContainer.pieces).toArray();

    if (this.itemType === 'agendaitem') {
      // Unlink pieces from subcase related to the agendaitem
      const agendaActivity = yield this.args.agendaitemOrSubcase.agendaActivity;
      if (agendaActivity) {
        const subcase = yield agendaActivity.subcase;
        const currentSubcaseLinkedPieces = yield subcase.hasMany('linkedPieces').reload();
        const subcasePieces = currentSubcaseLinkedPieces.removeObjects(linkedPiecesToRemove);
        subcase.set('linkedPieces', subcasePieces);
        yield subcase.save();
      }
    } else if (this.itemType === 'subcase') {
      // Unlink pieces from all agendaitems that are related to the subcase via an agendaActivity
      // and related to an agenda in the design status
      const agendaitems = yield this.store.query('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
        'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id,
      });
      const agendaitemUpdates = agendaitems.map(async(agendaitem) => {
        const currentAgendaitemLinkedPieces = await agendaitem.hasMany('linkedPieces').reload();
        const agendaitempieces = currentAgendaitemLinkedPieces.removeObjects(linkedPiecesToRemove);
        agendaitem.set('linkedPieces', agendaitempieces);
        await agendaitem.save();
      });
      yield all(agendaitemUpdates);
    }

    // Unlink pieces from subcase/agendaitem
    const currentLinkedPieces = yield this.args.agendaitemOrSubcase.hasMany('linkedPieces').reload();
    const newLinkedpieces = currentLinkedPieces.removeObjects(linkedPiecesToRemove);
    this.args.agendaitemOrSubcase.set('linkedPieces', newLinkedpieces);
    yield this.args.agendaitemOrSubcase.save();
    this.linkedPieces = newLinkedpieces;
  }
}
