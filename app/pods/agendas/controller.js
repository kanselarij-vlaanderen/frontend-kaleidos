import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { decamelize } from '@ember/string';
import moment from 'moment';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class AgendasController extends Controller.extend(DefaultQueryParamsMixin) {
  @service currentSession;
  @service intl;
  @service toaster;

  @tracked isCreatingNewSession = false;

  @action
  openNewSessionModal() {
    this.isCreatingNewSession = true;
  }

  @action
  closeNewSessionModal() {
    this.isCreatingNewSession = false;
  }

  @action
  async successfullyAdded(meeting) {
    this.set('isCreatingNewSession', false);
    const meetingType = CONFIG.kinds.find((type) => type.uri === meeting.kind);
    this.toaster.success(this.intl.t('successfully-created-meeting', {
      meetingType: decamelize(meetingType.label),
      meetingDate: moment(meeting.plannedStart).format('DD-MM-YYYY'),
    }));
    this.send('refreshRoute');
    this.transitionToRoute('agendas.overview');
  }
}
