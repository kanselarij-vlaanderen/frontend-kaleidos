import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { PromiseArray, PromiseObject } from '@ember-data/store/-private';
import EmberObject, { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';
import { KALEIDOS_START_DATE } from 'frontend-kaleidos/config/config';
import { isAnnexMeetingKind } from 'frontend-kaleidos/utils/meeting-utils';
import moment from 'moment';
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
  kind: attr('string'),
  releasedDocuments: attr('datetime'),
  releasedDecisions: attr('datetime'),

  agendas: hasMany('agenda', {
    inverse: null, serialize: false,
  }),
  requestedSubcases: hasMany('subcase'),
  pieces: hasMany('piece'),

  mainMeeting: belongsTo('meeting', {
    inverse: null,
  }),
  newsletter: belongsTo('newsletter-info'),
  mailCampaign: belongsTo('mail-campaign'),
  agenda: belongsTo('agenda', {
    inverse: null,
  }),

  themisPublicationActivities: hasMany('themis-publication-activity'),

  label: computed('plannedStart', 'kind', 'numberRepresentation', function() {
    const date = moment(this.plannedStart).format('DD-MM-YYYY');
    const kind = CONFIG.MINISTERRAAD_TYPES.TYPES.find((type) => type.uri === this.kind);
    const kindLabel = kind ? kind.altLabel : '';
    return `${kindLabel} ${this.intl.t('of')} ${date} (${this.numberRepresentation})`;
  }),

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

  canReleaseDecisions: computed('isFinal', 'releasedDecisions', function() {
    return this.isFinal && !this.releasedDecisions;
  }),

  canReleaseDocuments: computed('isFinal', 'releasedDocuments', function() {
    return this.isFinal && !this.releasedDocuments;
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

  latestAgendaName: computed('latestAgenda.status', 'agendas', 'intl', async function() {
    const agenda = await this.get('latestAgenda');
    if (!agenda) {
      return this.intl.t('no-agenda');
    }
    return await agenda.get('agendaName');
  }),

  kindToShow: computed('kind', function() {
    const options = CONFIG.MINISTERRAAD_TYPES.TYPES;
    const {
      kind,
    } = this;
    const foundOption = options.find((kindOption) => kindOption.uri === kind);


    return EmberObject.create(foundOption);
  }),

  isAnnex: computed('kind', function() {
    return isAnnexMeetingKind(this.kind);
  }),

  isPreKaleidos: computed('plannedStart', function () {
    return this.plannedStart < KALEIDOS_START_DATE;
  }),
});
