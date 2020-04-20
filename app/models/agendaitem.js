import DS from 'ember-data';
import EmberObject, {computed} from '@ember/object';
import {inject} from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import {alias} from '@ember/object/computed';
import ModelWithModifier from 'fe-redpencil/models/model-with-modifier';
import VRDocumentName, {compareFunction} from 'fe-redpencil/utils/vr-document-name';
import {A} from '@ember/array';
import {sortDocuments, getDocumentsLength} from 'fe-redpencil/utils/documents';

let {attr, belongsTo, hasMany, PromiseArray, PromiseObject} = DS;

export default ModelWithModifier.extend({
  modelName: alias('constructor.modelName'),
  agendaService: inject(),
  addedAgendaitems: alias('agendaService.addedAgendaitems'),
  addedDocuments: alias('agendaService.addedDocuments'),

  store: inject(),
  priority: attr('number'),
  created: attr('datetime'),
  record: attr('string'),
  retracted: attr('boolean'),
  showAsRemark: attr('boolean'),
  modified: attr('datetime'),
  titlePress: attr('string'),
  textPress: attr('string'),
  forPress: attr('boolean'),
  shortTitle: attr('string'),
  title: attr('string'),
  formallyOk: attr('string'),
  isApproval: attr('boolean'),
  explanation: attr('string'),

  postponedTo: belongsTo('postponed'),
  agenda: belongsTo('agenda', {inverse: null}),
  subcase: belongsTo('subcase', {inverse: null}),
  meetingRecord: belongsTo('meeting-record'),
  showInNewsletter: attr('boolean'), // only applies when showAsRemark = true

  remarks: hasMany('remark'),
  mandatees: hasMany('mandatee'),
  approvals: hasMany('approval'),
  documentVersions: hasMany('document-version'),
  linkedDocumentVersions: hasMany('document-version'),
  phases: hasMany('subcase-phase'),

  sortedDocumentVersions: computed('documentVersions.@each.name', function () {
    return A(this.get('documentVersions').toArray()).sort((a, b) => {
      return compareFunction(new VRDocumentName(a.get('name')), new VRDocumentName(b.get('name')));
    });
  }),

  documentsLength: computed('documents', function () {
    return getDocumentsLength(this, 'documents');
  }),

  linkedDocumentsLength: computed('linkedDocuments', function () {
    return getDocumentsLength(this, 'linkedDocuments');
  }),

  documents: computed('documentVersions.@each.name', function () {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.mapBy('id').join(',');
          return this.store.query('document', {
            filter: {
              'documents': {id: documentVersionIds},
            },
            page: {
              size: documentVersions.get('length'), // # documents will always be <= # document versions
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((containers) => {
            return sortDocuments(this, containers);
          });
        }
      })
    });
  }),

  linkedDocuments: computed('linkedDocumentVersions.@each', function () {
    return PromiseArray.create({
      promise: this.get('linkedDocumentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.mapBy('id').join(',');
          return this.store.query('document', {
            filter: {
              'documents': {id: documentVersionIds},
            },
            page: {
              size: documentVersions.get('length'), // # documents will always be <= # document versions
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((containers) => {
            return sortDocuments(this, containers);
          });
        }
      })
    });
  }),


  number: computed('displayPriority', 'priority', function () {
    const {priority, displayPriority} = this;
    if (!priority) {
      return displayPriority;
    } else {
      return priority;
    }
  }),

  isPostponed: computed('retracted', 'postponedTo', function () {
    return this.get('postponedTo').then((session) => {
      return !!session || this.get('retracted');
    });
  }),

  decisions: computed('subcase.decisions', function () {
    return PromiseArray.create({
      promise: this.store.query('decision', {
        filter: {
          subcase: {id: this.subcase.get('id')},
        }
      }).then((decisions) => {
        return decisions.sortBy('approved');
      }),
    });
  }),


  // get document names to show on agendaview when not in the viewport to assist lazy loading
  documentNames: computed('documentVersions', async function() {
    const names = await this.agendaService.getDocumentNames(this);
    return names;
  }),

  isDesignAgenda: computed('agenda', async function () {
    const agenda = await this.get('agenda');
    return await agenda.get('isDesignAgenda');
  }),

  nota: computed('documentVersions', function () {
    return PromiseObject.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map((item) => item.get('id')).join(',');

          return this.store
            .query('document', {
              filter: {
                'documents': {id: documentVersionIds},
                type: {id: CONFIG.notaID},
              },
              include: 'documents,type,documents.access-level',
            })
            .then((notas) => {
              return notas.get('firstObject');
            });
        }
      }),
    });
  }),

  sortedMandatees: computed('mandatees.@each', function () {
    return this.get('mandatees').sortBy('priority');
  }),

  subcasesFromCase: computed('subcase', function () {
    if (!this.get('subcase.id')) {
      return [];
    }
    return this.subcase.get('subcasesFromCase');
  }),

  formallyOkToShow: computed('formallyOk', function () {
    const options = CONFIG.formallyOkOptions;
    const {formallyOk} = this;
    const foundOption = options.find((formallyOkOption) => formallyOkOption.uri === formallyOk);

    return EmberObject.create(foundOption);
  }),

  requestedBy: computed('subcase.requestedBy', function () {
    return PromiseObject.create({
      promise: this.get('subcase.requestedBy').then((requestedBy) => {
        return requestedBy;
      }),
    });
  }),

  checkAdded: computed('id', 'addedAgendaitems.@each', 'agenda.createdFor.agendas.@each', async function () {
    const wasAdded = (this.addedAgendaitems && this.addedAgendaitems.includes(this.id));
    return wasAdded;
  }),

  isAdded: alias('checkAdded'),

  hasChanges: computed('checkAdded', 'hasAddedDocuments', async function () {
    const hasAddedDocuments = await this.hasAddedDocuments;
    const checkAdded = await this.checkAdded;
    return checkAdded || hasAddedDocuments;
  }),

  hasAddedDocuments: computed('documents.@each', 'addedDocuments.@each', async function () {
    const documents = await this.get('documents');
    return documents && documents.some((document) => document.checkAdded);
  }),

  sortedApprovals: computed('approvals.@each', async function () {
    return PromiseArray.create({
      promise: this.store.query('approval', {
        filter: {
          agendaitem: {id: this.get('id')},
        },
        sort: 'mandatee.priority',
      }),
    });
  }),
});
