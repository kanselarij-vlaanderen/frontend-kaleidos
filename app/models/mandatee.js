import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { lower as lowerCaseAlphabet } from 'alphabet';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  store: service(),
  toaster: service(),
  intl: service(),

  title: attr('string'),
  newsletterTitle: attr('string'),

  priority: attr('number'),
  start: attr('datetime'),
  end: attr('datetime'),

  person: belongsTo('person'),
  mandate: belongsTo('mandate'),

  subcases: hasMany('subcase', {
    inverse: null,
  }),
  requestedSubcases: hasMany('subcase', {
    inverse: null,
  }),
  agendaitems: hasMany('agendaitem', {
    inverse: null,
  }),
  publicationFlows: hasMany('publication-flow', {
    serialize: false,
  }),
  signSigningActivities: hasMany('sign-signing-activity'),

  // TODO this computed property is used in:
  // - mandatee#priorirtyAlpha
  // - settings.ministers template
  // - Utils::MandateeSelector
  // Refactor these uses and remove this computed property
  fullDisplayName: computed('person', 'title', 'person.nameToDisplay', 'mandate.role.label', function() {
    const nameToDisplay = this.get('person.nameToDisplay');
    const title = this.get('title') ?? this.get('mandate.role.label');
    if (nameToDisplay) {
      return `${nameToDisplay}, ${title}`;
    }
    return `${title}`;
  }),

  // Using this to sort will map the priority number to the alphabet, giving a correct alphabetical sort with numbers higher than 9.
  // TODO: clean up hacky map-to-alphabet sorting
  // TODO this computed property is used in:
  // - agendaitem-utils#setCalculatedGroupNumbers
  // Refactor this use and remove this computed property
  priorityAlpha: computed('priority', 'fullDisplayName', function() {
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
