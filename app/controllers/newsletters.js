import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {
  sort: '-planned-start',
  isAdding: false,
  isEditing: false,

  actions: {
    async navigateToNewsletter(meeting) {
      const latestAgenda = await meeting.get('latestAgenda')
      this.transitionToRoute('print-overviews.newsletter.agendaitems', meeting.get('id'), latestAgenda.get('id'));
    }
  }
});
