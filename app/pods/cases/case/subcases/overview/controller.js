import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['refresh'],

  isShowingOptions: false,
  isShowingProcess: false,
  refresh: false,

  actions: {
    backLinkAction() {
      this.transitionToRoute('cases');
    },
    refresh() {
      this.toggleProperty('refresh');
    },
  },
});
