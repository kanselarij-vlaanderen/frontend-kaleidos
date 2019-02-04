import Model from 'ember-data/model';
import { computed } from '@ember/object';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

export default Model.extend({
  firstName: attr(),
  lastName: attr(),
  rijksregisterNummer: attr(),
  account: hasMany('account', { inverse: null}),
  groups: hasMany('account-group'),
  group: computed('groups', function () {
    return this.get('groups.firstObject');
  }), // used for mock login
  fullName: computed('firstName', 'lastName', function() {
    return `${this.voornaam} ${this.achternaam}`.trim();
  })
});
