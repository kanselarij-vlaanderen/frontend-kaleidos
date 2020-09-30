import DS from 'ember-data';
import EmberObject, { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import { alias } from '@ember/object/computed';
import ModelWithModifier from 'fe-redpencil/models/model-with-modifier';
import VRDocumentName, { compareFunction } from 'fe-redpencil/utils/vr-document-name';
import { A } from '@ember/array';
import {
  sortDocuments, getDocumentsLength
} from 'fe-redpencil/utils/documents';

const {
  attr, belongsTo, hasMany, PromiseArray, PromiseObject,
} = DS;

export default ModelWithModifier.extend({
  modelName: alias('constructor.modelName'),
  agendaService: inject(),
  addedAgendaitems: alias('agendaService.addedAgendaitems'),
  addedDocuments: alias('agendaService.addedDocuments'),

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
  agendaActivity: belongsTo('agenda-activity', {
    inverse: null,
  }),
  treatments: hasMany('agenda-item-treatment', {
    inverse: null,
  }),
  meetingRecord: belongsTo('meeting-record'),
  showInNewsletter: attr('boolean'), // only applies when showAsRemark = true

  remarks: hasMany('remark'),
  mandatees: hasMany('mandatee'),
  approvals: hasMany('approval'),
  documentVersions: hasMany('document-version'),
  linkedDocumentVersions: hasMany('document-version'),

  sortedDocumentVersions: computed('documentVersions.@each.name', function() {
    return A(this.get('documentVersions').toArray()).sort((documentA, documentB) => compareFunction(new VRDocumentName(documentA.get('name')), new VRDocumentName(documentB.get('name'))));
  }),

  documentsLength: computed('documents', function() {
    return getDocumentsLength(this, 'documents');
  }),

  linkedDocumentsLength: computed('linkedDocuments', function() {
    return getDocumentsLength(this, 'linkedDocuments');
  }),

  documents: computed('documentVersions.@each.name', function() {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.mapBy('id').join(',');
          return this.store.query('document', {
            filter: {
              documents: {
                id: documentVersionIds,
              },
            },
            page: {
              size: documentVersions.get('length'), // # documents will always be <= # document versions
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((containers) => sortDocuments(this.get('documentVersions'), containers));
        }
      }),
    });
  }),

  linkedDocuments: computed('linkedDocumentVersions.@each', function() {
    return PromiseArray.create({
      promise: this.get('linkedDocumentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.mapBy('id').join(',');
          return this.store.query('document', {
            filter: {
              documents: {
                id: documentVersionIds,
              },
            },
            page: {
              size: documentVersions.get('length'), // # documents will always be <= # document versions
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((containers) => sortDocuments(this.get('linkedDocumentVersions'), containers));
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

  // get document names to show on agendaview when not in the viewport to assist lazy loading
  documentNames: computed('documentVersions', async function() {
    const names = await this.agendaService.getDocumentNames(this);
    return names;
  }),

  nota: computed('documentVersions', function() {
    return PromiseObject.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map((documentversion) => documentversion.get('id')).join(',');

          return this.store
            .query('document', {
              filter: {
                documents: {
                  id: documentVersionIds,
                },
                type: {
                  id: CONFIG.notaID,
                },
              },
              include: 'documents,type,documents.access-level',
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

  hasChanges: computed('checkAdded', 'hasAddedDocuments', async function() {
    const hasAddedDocuments = await this.hasAddedDocuments;
    const checkAdded = await this.checkAdded;
    return checkAdded || hasAddedDocuments;
  }),

  hasAddedDocuments: computed('documents.@each', 'addedDocuments.@each', async function() {
    const documents = await this.get('documents');
    return documents && documents.some((document) => document.checkAdded);
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
