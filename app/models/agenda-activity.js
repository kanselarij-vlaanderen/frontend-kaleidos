import DS from 'ember-data';
import { computed } from '@ember/object';

const {
  Model, attr, belongsTo, hasMany,
} = DS;

export default Model.extend({
  startDate: attr('datetime'),
  subcase: belongsTo('subcase'),
  agendaitems: hasMany('agendaitems'),

  // TODO, is this recomputing when an agenda is approved ? One of my tests says no. What are the possible side-effects??
  latestAgendaitem: computed('agendaitems.@each', async function() {
    const subcase = await this.get('subcase');
    const meeting = await subcase.get('requestedForMeeting');
    const latestAgenda = await meeting.get('latestAgenda');
    const agendaitems = await this.hasMany('agendaitems').reload();
    for (let index = 0; index < agendaitems.length; index++) {
      const agendaitem = agendaitems.objectAt(index);
      const agenda = await agendaitem.get('agenda');
      if (agenda.get('id') === latestAgenda.get('id')) {
        return agendaitem;
      }
    }
    return null;
  }),

});
