import DS from 'ember-data';
import { computed } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import EmberObject from '@ember/object';
let { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  plannedStart: attr('date'),
  startedOn: attr('date'),
  endedOn: attr('date'),
  location: attr('string'),
  number: attr('number'),
  isFinal: attr('boolean'),
  extraInfo: attr('string'),
  kind: attr('string'),

  agendas: hasMany('agenda', { inverse: null, serialize: false }),
  requestedSubcases: hasMany('subcase'),
  postponeds: hasMany('postponed'),
  relatedCases: hasMany('case'),

  notes: belongsTo('meeting-record'),
  newsletter: belongsTo('newsletter-info'),
  signature: belongsTo('signature'),

  latestAgenda: computed('agendas.@each', function() {
    return DS.PromiseObject.create({
      promise: this.get('agendas').then((agendas) => {
        const sortedAgendas = agendas.sortBy('agendaName').reverse();
        return sortedAgendas.get('firstObject');
      }),
    });
  }),

  latestAgendaName: computed('latestAgenda', 'agendas', function() {
    return this.get('latestAgenda').then((agenda) => {
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
});
