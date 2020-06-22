import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(DefaultQueryParamsMixin, {
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
