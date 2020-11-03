import DS from 'ember-data';
import { computed } from '@ember/object';

const {
  Model, attr, hasMany, belongsTo, PromiseObject,
} = DS;

export default Model.extend({
  created: attr('datetime'),
  title: attr('string'),
  shortTitle: attr('string'),
  number: attr('string'),
  isArchived: attr('boolean'),
  confidential: attr('boolean'),

  publicationFlow: belongsTo('publication-flow', {
    inverse: null,
  }),

  subcases: hasMany('subcase'),

  latestSubcase: computed('subcases.@each', function() {
    return PromiseObject.create({
      promise:
        this.get('subcases').then((subcases) => {
          const sortedSubcases = subcases.sortBy('created');
          return sortedSubcases.get('lastObject');
        }),
    });
  }),

});
