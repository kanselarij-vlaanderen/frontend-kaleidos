import Component from '@ember/component';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-l'],

  actions: {
    toggleIsShowingDocuments(subcase) {
      subcase.toggleProperty('isShowingDocuments');
    },
  }
});
