import DS from 'ember-data';
import {computed} from '@ember/object';

const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  startDate: attr('datetime'),
  subcase: belongsTo('subcase'),
  agendaitems: hasMany('agendaitems'),

  latestAgendaitem: computed('agendaitems.@each', async function () {
    const agendaitems = await this.get('agendaitems').then(agendaitems => {
      return agendaitems.sortBy('modified');
    })
    return agendaitems.get('lastObject'); 
  }),

});