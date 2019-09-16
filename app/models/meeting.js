import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import EmberObject from '@ember/object';
const { Model, attr, hasMany, belongsTo, PromiseArray, PromiseObject } = DS;

export default Model.extend({
  intl: inject(),
  plannedStart: attr('date'),
  startedOn: attr('date'),
  endedOn: attr('date'),
  location: attr('string'),
  number: attr('number'),
  isFinal: attr('boolean'),
  extraInfo: attr('string'),
  kind: attr('string'),
  releasedDocuments: attr('date'),
  releasedDecisions: attr('date'),

  agendas: hasMany('agenda', { inverse: null, serialize: false }),
  requestedSubcases: hasMany('subcase'),
  postponeds: hasMany('postponed'),
  relatedCases: hasMany('case'),
  documentVersions: hasMany('document-version'),

  notes: belongsTo('meeting-record'),
  newsletter: belongsTo('newsletter-info'),
  signature: belongsTo('signature'),
  mailCampaign: belongsTo('mail-campaign'),

  canReleaseDecisions: computed('isFinal', 'releasedDecisions', function(){
    return this.isFinal && !this.releasedDecisions;
  }),

  canReleaseDocuments: computed('isFinal', 'releasedDocuments', function(){
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

  sortedAgendas: computed('agendas.@each', function() {
    return this.agendas.sortBy('agendaName').reverse();
  }),

  latestAgendaName: computed('latestAgenda', 'agendas', 'intl', function() {
    return this.get('latestAgenda').then((agenda) => {
      if (!agenda) return this.intl.t("no-agenda");
      const agendaLength = this.get('agendas.length');
      const agendaName = agenda.name;
      if (agendaName !== 'Ontwerpagenda') {
        return `Agenda ${agendaName}`;
      } else {
        return `${agendaName} ${CONFIG.alphabet[agendaLength - 1]}`;
      }
    });
  }),

  defaultSignature: computed('signature', async function() {
    const signature = await this.get('signature');
    if (!signature) {
      return DS.PromiseObject.create({
        promise: this.store
          .query('signature', { filter: { 'is-active': true } })
          .then((signatures) => {
            return signatures.objectAt(0);
          }),
      });
    } else {
      return signature;
    }
  }),

  kindToShow: computed('kind', function() {
    const options = CONFIG.kinds;
    const { kind } = this;
    const foundOption = options.find((kindOption) => kindOption.uri === kind);

    return EmberObject.create(foundOption);
  }),

  documents: computed('documentVersions.@each', function () {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map((item) => item.get('id')).join(',');
          return this.store.query('document', {
            filter: {
              'document-versions': { id: documentVersionIds },
            },
            include: 'type,document-versions',
          }).then((documents) => {
            // Sorting is done in the frontend to work around a Virtuoso issue, where
            // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
            // some items not being returned. By not having a sort parameter, this doesn't occur.
            return documents.sortBy('type.priority', 'numberVr');
          });
        }
      })
    });
  }),

  documentsLength: computed('documents', function () {
    return PromiseObject.create({
      promise: this.get('documents').then((documents) => {
        return documents.get('length');
      })
    });
  }),
});
