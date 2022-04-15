import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
// TODO: determine if these default qp's are still needed here, otherwise refactor to mixin-less solution
// eslint-disable-next-line ember/no-mixins
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default class AgendasController extends Controller.extend(DefaultQueryParamsMixin) {
  @service store;
  @service currentSession;

  @tracked isCreatingNewSession = false;
  @tracked newMeeting = this.store.createRecord('meeting');

  @action
  openNewSessionModal() {
    this.isCreatingNewSession = true;
  }

  @action
  closeNewSessionModal() {
    this.isCreatingNewSession = false;
    this.newMeeting.deleteRecord();
    this.newMeeting = this.store.createRecord('meeting');
  }

  @action
  successfullyAdded() {
    this.isCreatingNewSession = false;
    this.newMeeting = this.store.createRecord('meeting');
    this.send('refreshRoute');
    this.transitionToRoute('agendas.overview');
  }
}
