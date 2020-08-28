import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  intl: inject(),
  tagName: 'li',
  classNames: ['vlc-minister-item'],
  showDetails: false,

  subcaseIseCodes: null,
  codesToShow: null,

  titleToShow: computed('mandatee.person', function() {
    return `${this.mandatee.get('person.nameToDisplay')}${this.intl.t('divider')}${this.mandatee.get('title')}`;
  }),

  actions: {
    toggleShowDetails() {
      this.toggleProperty('showDetails');
    },
  },
});
