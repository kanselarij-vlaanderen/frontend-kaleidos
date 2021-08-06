import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Controller.extend(DefaultQueryParamsMixin, {
  sort: '-planned-start,number-representation',
  isAdding: false,
  isEditing: false,

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    async navigateToNewsletter(meeting) {
      this.transitionToRoute('newsletter', meeting.get('id'));
    },
  },
});
