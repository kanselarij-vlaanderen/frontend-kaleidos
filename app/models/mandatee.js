import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { lower as lowerCaseAlphabet } from 'alphabet';

const {
  Model, attr, hasMany, belongsTo,
} = DS;

export default Model.extend({
  toaster: service(),
  intl: service(),

  title: attr('string'),
  nickName: attr('string'),
  priority: attr('number'),
  start: attr('datetime'),
  end: attr('datetime'),
  dateSwornIn: attr('datetime'),
  dateDecree: attr('datetime'),

  person: belongsTo('person'),

  iseCodes: hasMany('ise-code', {
    inverse: null,
  }),

  approvals: hasMany('approval'),
  subcases: hasMany('subcase', {
    inverse: null,
  }),
  publicationFlows: hasMany('publication-flow', {
    serialize: false,
  }),
  requestedSubcases: hasMany('subcase', {
    inverse: null,
  }),
  agendaitems: hasMany('agendaitem', {
    inverse: null,
  }),

  fullDisplayName: computed('person', 'title', 'person.nameToDisplay', function() {
    const nameToDisplay = this.get('person.nameToDisplay');
    if (nameToDisplay) {
      return `${nameToDisplay}, ${this.get('title')}`;
    }
    return `${this.get('title')}`;
  }),

  /**
   * Using this to sort will map the priority number to the alphabet, giving a correct alphabetical sort with numbers higher than 9.
   * TODO: clean up hacky map-to-alphabet sorting
   */
  priorityAlpha: computed('priority', function() {
    const priority = this.get('priority');
    if (typeof priority === 'number') {
      const alphaNumeric = lowerCaseAlphabet[priority - 1];
      return alphaNumeric;
    }
    const errorMessage = this.intl.t('mandatee-without-priority-message', {
      name: this.get('fullDisplayName'),
    });
    this.toaster.error(errorMessage,
      this.intl.t('warning-title'),
      {
        timeOut: 60000,
      });
    return null;
  }),
});
