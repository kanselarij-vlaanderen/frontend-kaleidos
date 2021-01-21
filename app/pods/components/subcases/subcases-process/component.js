import Component from '@ember/component';

export default Component.extend({
  classNames: ['auk-u-m-8'],

  actions: {
    toggleIsShowingDocuments(subcase) {
      subcase.toggleProperty('isShowingDocuments');
    },
  },
});
