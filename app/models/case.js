import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  created: attr('date'),
  title: attr('string'),
  shortTitle: attr('string'),
  number: attr('string'),

  type: belongsTo('case-type'),
  mandatees: hasMany('mandatee'),
  remark: hasMany('remark'),
  themes: hasMany('theme'),
  subcases: hasMany('subcase'),
  related: hasMany('case'),
  creators: hasMany('person'),

  latestSubcase: computed('subcases', function() {
    const subcases = this.get('subcases');
    if(subcases && subcases.length > 0) {
      const currentSubcase = subcases.sortBy('created').get('lastObject');
      return currentSubcase;
    } else {
      return {title:"Nog geen procedurestap."}
    }
  })
});
