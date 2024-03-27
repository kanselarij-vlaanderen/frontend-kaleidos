// !! This component was migrated from lblod/ember-vo-webuniversum as part of KAS-3217 and is a dependency of lblod/ember-vo-webuniversum-data-table.
// SOURCE: https://github.com/lblod/ember-vo-webuniversum/blob/master/addon/components/wu-icon.js
// TODO: When lblod/ember-vo-webuniversum-data-table is fully removed from Kaleidos, this component can be removed.

// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

// eslint-disable-next-line ember/no-classic-classes
let WuIconComponent = Component.extend({
  // eslint-disable-next-line ember/require-tagless-components
  tagName: 'i',
  classNames: [],
  classNameBindings: [
    'iconClass',
    'isFaIcon:fa',
    'isViIcon:vi'
  ],
  iconClass: alias('icon'),
  isFaIcon: computed('icon', function() {
    /* eslint-disable ember/no-get */
    return this.icon && this.icon.startsWith('fa-');
  }),
  isViIcon: computed('icon', function() {
    /* eslint-disable ember/no-get */
    return this.icon && this.icon.startsWith('vi-');
  })
});

WuIconComponent.reopenClass({
  positionalParams: ['icon']
});

export default WuIconComponent;
