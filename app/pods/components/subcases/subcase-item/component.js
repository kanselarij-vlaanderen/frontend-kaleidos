import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vlc-procedure-step'],
  classNameBindings: ['getClassNames'],

  getClassNames: computed('isMinimal', function() {
    const {
      isMinimal,
    } = this;
    if (isMinimal) {
      return 'vlc-procedure-step--minimal';
    }
    return null;
  }),
});
