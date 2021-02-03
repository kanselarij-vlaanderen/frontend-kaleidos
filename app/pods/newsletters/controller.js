import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(DefaultQueryParamsMixin, {
  sort: '-planned-start,number-representation',
  isAdding: false,
  isEditing: false,

  actions: {
    async navigateToNewsletter(meeting) {
      this.transitionToRoute('newsletter', meeting.get('id'));
    },
  },
});
