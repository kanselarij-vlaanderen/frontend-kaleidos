import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
// eslint-disable-next-line ember/no-mixins
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default class NewslettersIndexController extends Controller.extend(DefaultQueryParamsMixin) {
  @service router;

  @tracked sort = '-planned-start,number-representation';
  @tracked isAdding = false;
  @tracked isEditing = false;

  @action
  async navigateToNewsletter(meeting) {
    this.router.transitionTo('newsletter', meeting.id);
  }

  get currentRoute() {
    const currentRouteName = this.router.currentRouteName;
    return currentRouteName;
  }
}
