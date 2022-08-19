import { hasMany, belongsTo, attr } from '@ember-data/model';
import { PromiseObject } from '@ember-data/store/-private';
import EmberObject, { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import CONFIG from 'frontend-kaleidos/utils/config';
import { alias } from '@ember/object/computed';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';
import VRDocumentName, { compareFunction } from 'frontend-kaleidos/utils/vr-document-name';
import { A } from '@ember/array';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
export default ModelWithModifier.extend({
  modelName: alias('constructor.modelName'),

  store: inject(),
  number: attr('number'),
  created: attr('datetime'),
  retracted: attr('boolean'), // TODO 1420 TRUE = postponed, move to treatment
  modified: attr('datetime'),
  titlePress: attr('string'),
  textPress: attr('string'),
  forPress: attr('boolean'),
  shortTitle: attr('string'),
  title: attr('string'),
  formallyOk: attr('string'),
  isApproval: attr('boolean'), // isGoedkeuringVanDeNotulen
  comment: attr('string'),
  privateComment: attr('string'),

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
  treatment: belongsTo('agenda-item-treatment'),
  type: belongsTo('concept'),

  mandatees: hasMany('mandatee'),
  pieces: hasMany('piece'),
  linkedPieces: hasMany('piece'),

  // TODO this computed property is used in:
  // - Agenda::PrintableAgenda::ListSection::ItemGroup
  // - Agenda::PrintableAgenda::ListSection::ItemGroup::Item
  // Refactor these uses and remove this computed property
  sortedPieces: computed('pieces.@each.name', function() {
    return A(this.get('pieces').toArray()).sort((pieceA, pieceB) => compareFunction(new VRDocumentName(pieceA.get('name')), new VRDocumentName(pieceB.get('name'))));
  }),

  // TODO this computed property is used in:
  // - agendaitem#notaOrVisienota
  // Refactor these usages and remove this computed property
  nota: computed('id', function() {
    return PromiseObject.create({
      promise: this.store.queryOne('document-container', {
        filter: {
          pieces: {
            agendaitems: {
              id: this.id,
            },
          },
          type: {
            ':uri:': CONSTANTS.DOCUMENT_TYPES.NOTA,
          },
        },
        include: 'pieces,type,pieces.access-level',
      }),
    });
  }),

  // TODO this computed property is used in:
  // - NewsletterItem::EditPanel
  // - NewsletterItem::TableRow
  // Refactor these usages and remove this computed property
  notaOrVisienota: computed('id', 'nota', function() {
    return PromiseObject.create({
      promise: this.nota.then((nota) => {
        if (nota) {
          return nota;
        }
        return this.store.queryOne('document-container', {
          filter: {
            pieces: {
              agendaitems: {
                id: this.id,
              },
            },
            type: {
              ':uri:': CONSTANTS.DOCUMENT_TYPES.VISIENOTA,
            },
          },
          include: 'pieces,type,pieces.access-level',
        });
      }),
    });
  }),

  // TODO this computed property is used in:
  // - agenda.print controller#notaGroups
  // - Agenda::AgendaDetail::Sidebar
  // - Agenda::AgendaOverview
  // - Agenda::PrintableAgenda::ListSection::ItemGroup
  // - agenda-service#groupAgendaitemsOnGroupName
  // Refactor these usages and remove this computed property
  sortedMandatees: computed('mandatees.[]', function() {
    return this.get('mandatees').sortBy('priority');
  }),

  // TODO this computed property is used in:
  // - Agenda::AgendaOverview::AgendaOverviewItem
  // - Agenda::AgendaDetail::SidebarItem
  // - Agenda::Agendaheader::AgendaActionPopupAgendaitems
  // - Agenda::Agendaitem::AgendaitemCasePanel::AgendaitemCasePanelView
  // Refactor these usages and remove this computed property
  formallyOkToShow: computed('formallyOk', function() {
    const options = CONFIG.formallyOkOptions;
    const foundOption = options.find((formallyOkOption) => formallyOkOption.uri === this.formallyOk);
    return EmberObject.create(foundOption);
  }),
});
