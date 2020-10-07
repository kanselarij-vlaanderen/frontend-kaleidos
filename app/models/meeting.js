import DS from 'ember-data';
import EmberObject, { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';

import {
  sortDocumentContainers, getPropertyLength
} from 'fe-redpencil/utils/documents';

const {
  Model, attr, hasMany, belongsTo, PromiseArray,
} = DS;

export default Model.extend({
  intl: inject(),
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
    inverse: null,
  }),
  requestedSubcases: hasMany('subcase'),
  pieces: hasMany('piece'),

  notes: belongsTo('meeting-record'),
  newsletter: belongsTo('newsletter-info'),
  signature: belongsTo('signature'),
  mailCampaign: belongsTo('mail-campaign'),
  agenda: belongsTo('agenda', {
    inverse: null,
  }),

  documentContainersLength: computed('documentContainers', function() {
    return getPropertyLength(this, 'documentContainers');
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

  canReleaseDecisions: computed('isFinal', 'releasedDecisions', function() {
    return this.isFinal && !this.releasedDecisions;
  }),

  canReleaseDocuments: computed('isFinal', 'releasedDocuments', function() {
    return this.isFinal && !this.releasedDocuments;
  }),

  latestAgenda: computed('agendas.@each', function() {
    return DS.PromiseObject.create({
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

  defaultSignature: computed('signature', async function() {
    const signature = await this.get('signature');
    if (!signature) {
      return DS.PromiseObject.create({
        promise: this.store
          .query('signature', {
            filter: {
              'is-active': true,
            },
          })
          .then((signatures) => signatures.objectAt(0)),
      });
    }
    return signature;
  }),

  kindToShow: computed('kind', function() {
    const options = CONFIG.kinds;
    const {
      kind,
    } = this;
    const foundOption = options.find((kindOption) => kindOption.uri === kind);

    return EmberObject.create(foundOption);
  }),

});
