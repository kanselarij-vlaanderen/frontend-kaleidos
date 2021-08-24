import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  startDate: attr('datetime'),
  subcase: belongsTo('subcase'),
  agendaitems: hasMany('agendaitems'), // TODO ember-data model name should be singular?
  submissionActivities: hasMany('submission-activity'),

  latestAgendaitem: computed('agendaitems.[]', 'subcase', async function() {
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
