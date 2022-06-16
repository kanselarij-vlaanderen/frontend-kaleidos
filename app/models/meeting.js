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
  // releasedDocuments: attr('datetime'), // TODO KAS-3431: replace this attr and everything depending on it
  // releasedDecisions: attr('datetime'), // TODO KAS-3431: replace this attr and everything depending on it

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

  decisionPublicationActivity: belongsTo('decision-publication-activity'),
  documentPublicationActivity: belongsTo('document-publication-activity'),
  themisPublicationActivities: hasMany('themis-publication-activity'),

  // This computed does not seem to be used anywhere
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
  
  latestAgenda: computed('agendas.[]', function() {
    return PromiseObject.create({
      promise: this.get('agendas').then((agendas) => {
        const sortedAgendas = agendas.sortBy('agendaName').reverse();
        return sortedAgendas.get('firstObject');
      }),
    });
  }),

  sortedAgendas: computed('agendas.@each.agendaName', function() {
    return PromiseArray.create({
      promise: this.get('agendas').then((agendas) => agendas.sortBy('agendaName').reverse()),
    });
  }),

  isPreKaleidos: computed('plannedStart', function () {
    return this.plannedStart < KALEIDOS_START_DATE;
  }),
});
