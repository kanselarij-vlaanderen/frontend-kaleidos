import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
// eslint-disable-next-line ember/no-mixins
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import bind from 'frontend-kaleidos/utils/bind';

export default class NewslettersIndexController extends Controller.extend(DefaultQueryParamsMixin) {
  @service router;

  @tracked sort = '-planned-start,number-representation';

  @bind
  async latestAgenda(meeting) {
    const agendas = await meeting.agendas;
    return agendas?.sortBy('serialnumber').reverse().firstObject;
  }

  @action
  async navigateToNewsletter(meeting) {
    this.router.transitionTo('newsletter', meeting.id);
  }
}
