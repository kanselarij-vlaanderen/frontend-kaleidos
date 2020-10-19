import DS from 'ember-data';
import EmberObject, { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import { alias } from '@ember/object/computed';
import ModelWithModifier from 'fe-redpencil/models/model-with-modifier';
import VRDocumentName, { compareFunction } from 'fe-redpencil/utils/vr-document-name';
import { A } from '@ember/array';
import {
  sortDocumentContainers, getPropertyLength
} from 'fe-redpencil/utils/documents';

const {
  attr, belongsTo, hasMany, PromiseArray, PromiseObject,
} = DS;

export default ModelWithModifier.extend({
  modelName: alias('constructor.modelName'),
  agendaService: inject(),
  addedAgendaitems: alias('agendaService.addedAgendaitems'),
  addedPieces: alias('agendaService.addedPieces'),

  store: inject(),
  priority: attr('number'),
  created: attr('datetime'),
  record: attr('string'),
  retracted: attr('boolean'), // TODO 1420 TRUE = postponed, move to treatment
  showAsRemark: attr('boolean'),
  modified: attr('datetime'),
  titlePress: attr('string'),
  textPress: attr('string'),
  forPress: attr('boolean'),
  shortTitle: attr('string'),
  title: attr('string'),
  formallyOk: attr('string'),
  isApproval: attr('boolean'), // isGoedkeuringVanDeNotulen
  explanation: attr('string'),
  // More information: https://github.com/kanselarij-vlaanderen/kaleidos-frontend/pull/469.

  agenda: belongsTo('agenda', {
    inverse: null,
  }),
  nextAgendaitem: belongsTo('agendaitem', {
    inverse: 'previousAgendaitem',
  }),
  previousAgendaitem: belongsTo('agendaitem', {
    inverse: 'nextAgendaitem',
  }),
  agendaActivity: belongsTo('agenda-activity', {
    inverse: null,
  }),
  treatments: hasMany('agenda-item-treatment', {
    inverse: null,
  }),
  showInNewsletter: attr('boolean'), // only applies when showAsRemark = true

  remarks: hasMany('remark'),
  mandatees: hasMany('mandatee'),
  approvals: hasMany('approval'),
  pieces: hasMany('piece'),
  linkedPieces: hasMany('piece'),

  sortedPieces: computed('pieces.@each.name', function() {
    return A(this.get('pieces').toArray()).sort((pieceA, pieceB) => compareFunction(new VRDocumentName(pieceA.get('name')), new VRDocumentName(pieceB.get('name'))));
  }),

  documentContainersLength: computed('documentContainers', function() {
    return getPropertyLength(this, 'documentContainers');
  }),

  linkedDocumentContainersLength: computed('linkedDocumentContainers', function() {
    return getPropertyLength(this, 'linkedDocumentContainers');
  }),

  documentContainers: computed('pieces.@each.name', function() {
    return PromiseArray.create({
      promise: this.get('pieces').then((pieces) => {
        if (pieces && pieces.get('length') > 0) {
          const pieceIds = pieces.mapBy('id').join(',');
          return this.store.query('document-container', {
            filter: {
              pieces: {
                id: pieceIds,
              },
            },
            page: {
              size: pieces.get('length'), // # documentContainers will always be <= # pieces
            },
            include: 'type,pieces,pieces.access-level,pieces.next-piece,pieces.previous-piece',
          }).then((containers) => sortDocumentContainers(this.get('pieces'), containers));
        }
      }),
    });
  }),

  linkedDocumentContainers: computed('linkedPieces.@each', function() {
    return PromiseArray.create({
      promise: this.get('linkedPieces').then((pieces) => {
        if (pieces && pieces.get('length') > 0) {
          const pieceIds = pieces.mapBy('id').join(',');
          return this.store.query('document-container', {
            filter: {
              pieces: {
                id: pieceIds,
              },
            },
            page: {
              size: pieces.get('length'), // # documentContainers will always be <= # pieces
            },
            include: 'type,pieces,pieces.access-level,pieces.next-piece,pieces.previous-piece',
          }).then((containers) => sortDocumentContainers(this.get('linkedPieces'), containers));
        }
      }),
    });
  }),

  number: computed('displayPriority', 'priority', function() {
    const {
      priority, displayPriority,
    } = this;
    if (!priority) {
      return displayPriority;
    }
    return priority;
  }),

  isDesignAgenda: computed('agenda.isDesignAgenda', function() {
    return this.get('agenda.isDesignAgenda');
  }),

  // get piece names to show on agendaview when not in the viewport to assist lazy loading
  pieceNames: computed('pieces', async function() {
    const names = await this.agendaService.getPieceNames(this);
    return names;
  }),

  nota: computed('pieces', function() {
    return PromiseObject.create({
      promise: this.get('pieces').then((pieces) => {
        if (pieces && pieces.get('length') > 0) {
          const pieceIds = pieces.map((piece) => piece.get('id')).join(',');

          return this.store
            .query('document-container', {
              filter: {
                pieces: {
                  id: pieceIds,
                },
                type: {
                  id: CONFIG.notaID,
                },
              },
              include: 'pieces,type,pieces.access-level',
            })
            .then((notas) => notas.get('firstObject'));
        }
      }),
    });
  }),

  sortedMandatees: computed('mandatees.@each', function() {
    return this.get('mandatees').sortBy('priority');
  }),

  formallyOkToShow: computed('formallyOk', function() {
    const options = CONFIG.formallyOkOptions;
    const foundOption = options.find((formallyOkOption) => formallyOkOption.uri === this.formallyOk);
    return EmberObject.create(foundOption);
  }),

  checkAdded: computed('id', 'addedAgendaitems.@each', 'agenda.createdFor.agendas.@each', async function() {
    const wasAdded = (this.addedAgendaitems && this.addedAgendaitems.includes(this.id));
    return wasAdded;
  }),

  isAdded: alias('checkAdded'),

  hasChanges: computed('checkAdded', 'hasAddedPieces', async function() {
    const hasAddedPieces = await this.hasAddedPieces;
    const checkAdded = await this.checkAdded;
    return checkAdded || hasAddedPieces;
  }),

  hasAddedPieces: computed('documentContainers.@each', 'addedPieces.@each', async function() {
    const documentContainers = await this.get('documentContainers');
    return documentContainers && documentContainers.some((documentContainers) => documentContainers.checkAdded);
  }),

  sortedApprovals: computed('approvals.@each', async function() {
    return PromiseArray.create({
      promise: this.store.query('approval', {
        filter: {
          agendaitem: {
            id: this.get('id'),
          },
        },
        sort: 'mandatee.priority',
      }),
    });
  }),
});
