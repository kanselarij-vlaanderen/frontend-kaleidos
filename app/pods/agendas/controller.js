import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
// TODO: determine if these default qp's are still needed here, otherwise refactor to mixin-less solution
// eslint-disable-next-line ember/no-mixins
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default class AgendasController extends Controller.extend(DefaultQueryParamsMixin) {
  @service router;
  @service currentSession;

  @tracked isCreatingNewSession = false;
  @tracked sort = '-status,created-for.planned-start';

  @action
  openNewSessionModal() {
    this.isCreatingNewSession = true;
  }

  @action
  closeNewSessionModal() {
    this.isCreatingNewSession = false;
  }

  @action
  successfullyAdded() {
    this.isCreatingNewSession = false;
    this.send('refreshRoute');
  }

  @action
  async onClickRow(agenda) {
    console.debug('called onClickRow')
    const meeting = await agenda.createdFor;
    this.router.transitionTo('agenda.agendaitems', meeting.id, agenda.id);
  }
}
