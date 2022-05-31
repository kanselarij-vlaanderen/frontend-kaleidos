import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { PromiseArray, PromiseObject } from '@ember-data/store/-private';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { KALEIDOS_START_DATE } from 'frontend-kaleidos/config/config';
import {
  sortDocumentContainers
} from 'frontend-kaleidos/utils/documents';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  intl: inject(),
  store: inject(),

  uri: attr('string'),
  plannedStart: attr('datetime'),
  startedOn: attr('datetime'),
  endedOn: attr('datetime'),
  location: attr('string'),
  number: attr('number'),
  numberRepresentation: attr('string'),
  isFinal: attr('boolean'),
  extraInfo: attr('string'),
  releasedDocuments: attr('datetime'),
  releasedDecisions: attr('datetime'),

  agendas: hasMany('agenda', {
    inverse: null, serialize: false,
  }),
  requestedSubcases: hasMany('subcase'),
  pieces: hasMany('piece'),

  kind: belongsTo('concept'),
  mainMeeting: belongsTo('meeting', {
    inverse: null,
  }),
  newsletter: belongsTo('newsletter-info'),
  mailCampaign: belongsTo('mail-campaign'),
  agenda: belongsTo('agenda', {
    inverse: null,
  }),

  themisPublicationActivities: hasMany('themis-publication-activity'),

  // TODO this computed property is used in:
  // - agendaitem#hasAddedPieces
  // Refactor that usage and remove this computed property
  documentContainers: computed('pieces.@each.name', 'id', 'store', function() {
    return PromiseArray.create({
      promise: this.get('pieces').then((pieces) => {
        if (pieces && pieces.get('length') > 0) {
          return this.store.query('document-container', {
            filter: {
              pieces: {
                meeting: {
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

  // TODO this computed property is used in:
  // - agenda-activity#latestAgendaitem
  // Refactor that usage and remove this computed property
  latestAgenda: computed('agendas.[]', function() {
    return PromiseObject.create({
      promise: this.get('agendas').then((agendas) => {
        const sortedAgendas = agendas.sortBy('agendaName').reverse();
        return sortedAgendas.get('firstObject');
      }),
    });
  }),

  // TODO this computed property is used in:
  // - agenda template
  // - Agenda::PrintableAgenda
  // - Agenda::AgendaHeader
  // Refactor these usages and remove this computed property
  isPreKaleidos: computed('plannedStart', function () {
    return this.plannedStart < KALEIDOS_START_DATE;
  }),
});
