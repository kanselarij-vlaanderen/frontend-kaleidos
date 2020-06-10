import DS from 'ember-data';
import {computed} from '@ember/object';

const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  startDate: attr('datetime'),
  subcase: belongsTo('subcase', { inverse: null }),
  agendaitems: hasMany('agendaitems'),

  latestAgendaitem: computed('agendaitems.@each', async function () {
    const agendaitems = await this.get('agendaitems')
    // const sortedAgendaitems = await agendaitems.sortby('created'); // TODO KAS-1425 sorted items are undefined
    return agendaitems.get('lastObject'); 
  }),

});