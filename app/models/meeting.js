import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { KALEIDOS_START_DATE } from 'frontend-kaleidos/config/config';

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
  // - agenda template
  // - Agenda::PrintableAgenda
  // - Agenda::AgendaHeader
  // Refactor these usages and remove this computed property
  isPreKaleidos: computed('plannedStart', function () {
    return this.plannedStart < KALEIDOS_START_DATE;
  }),
});
