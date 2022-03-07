// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
// import layout from '../templates/components/wu-icon';

// eslint-disable-next-line ember/no-classic-classes
let WuIconComponent = Component.extend({
  // layout,
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
    return this.get('icon') && this.get('icon').startsWith('fa-');
  }),
  isViIcon: computed('icon', function() {
    /* eslint-disable ember/no-get */
    return this.get('icon') && this.get('icon').startsWith('vi-');
  })
});

WuIconComponent.reopenClass({
  positionalParams: ['icon']
});

export default WuIconComponent;
