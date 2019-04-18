import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	changedSet: null,

  hasRightAgenda: computed('changedSet', function () {
    return !!this.changedSet && !!this.changedSet.right;
  }),

  hasLeftAgenda: computed('changedSet', function () {
    return !!this.changedSet && !!this.changedSet.left;
  }),

  left: computed('changedSet', function () {
    const { left, right } = this.changedSet;

    if (right){

    }

    return left;
  }),


  right: computed('changedSet', function () {
    const { left, right } = this.changedSet;

    if (left){

    }

    return right;
  }),

});
