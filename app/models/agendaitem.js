import DS from 'ember-data';
import EmberObject, { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';
import {
  alias, deprecatingAlias
} from '@ember/object/computed';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';
import VRDocumentName, { compareFunction } from 'frontend-kaleidos/utils/vr-document-name';
import { A } from '@ember/array';
import {
  sortDocumentContainers, getPropertyLength
} from 'frontend-kaleidos/utils/documents';

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
  // the next and previous version of agendaitem is set in agenda-approve-service, read-only in frontend
  nextVersion: belongsTo('agendaitem', {
    inverse: 'previousVersion',
    serialize: false,
  }),
  previousVersion: belongsTo('agendaitem', {
    inverse: 'nextVersion',
    serialize: false,
  }),
  agendaActivity: belongsTo('agenda-activity', {
    inverse: null,
  }),
  treatments: hasMany('agenda-item-treatment', {
    inverse: null,
  }),

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


  documentContainers: computed('pieces.@each.name', function() {
    return PromiseArray.create({
      promise: this.get('pieces').then((pieces) => {
        if (pieces && pieces.get('length') > 0) {
          return this.store.query('document-container', {
            filter: {
              pieces: {
                agendaitems: {
                  id: this.get('id'),
                },
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


  number: deprecatingAlias('priority', {
    id: 'agendaitem-number-deprecated',
    until: 'unknown',
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
          return this.store
            .query('document-container', {
              filter: {
                pieces: {
                  agendaitems: {
                    id: this.get('id'),
                  },
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

  case: computed('treatments.firstObject.subcase.case', async function() {
    const agendaItemTreatments = await this.get('treatments');
    const agendaItemTreatment = agendaItemTreatments.firstObject; // TODO: Agendaitem can have many treatments (decisions)
    const subcase = await agendaItemTreatment.get('subcase');
    if (!subcase) {
      return false;
    }
    const _case = await subcase.get('case');
    if (!_case) {
      return false;
    }
    return _case;
  }),

  publicationFlow: computed('treatments.firstObject.subcase.case.publicationFlow', async function() {
    const _case = await this.get('case');
    if (!_case) {
      return false;
    }
    const publicationFlow = await _case.get('publicationFlow');
    // Preload case.
    await publicationFlow.get('case');
    await publicationFlow.reload();
    if (!publicationFlow) {
      return false;
    }
    return publicationFlow;
  }),

  publicationFlowId: computed('treatments.firstObject.subcase.case.publicationFlow', async function() {
    const publicationFlow = await this.get('publicationFlow');
    return publicationFlow.id;
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

  newsletterInfo: computed('treatments.@each.newsletterInfo', 'treatments', async function() {
    const newsletterInfos = await this.store.query('newsletter-info', {
      'filter[agenda-item-treatment][agendaitem][:id:]': this.get('id'),
    });
    return newsletterInfos.get('firstObject');
  }),
});
