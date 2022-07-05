import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import moment from 'moment';
import { A } from '@ember/array';
import { restartableTask, timeout } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import AgendaPublicationUtils from 'frontend-kaleidos/utils/agenda-publication';

export default class AgendasController extends Controller {
  queryParams = ['page', 'size', 'sort', 'filter'];

  @service store;
  @service currentSession;
  @service router;
  @service newsletterService;

  @tracked newMeeting;

  @tracked isLoadingModel = false;
  @tracked isCreatingNewSession = false;
  @tracked filter = null;
  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = 'created-for.is-final,-created-for.planned-start,created-for.kind.label';

  dateRegex = /^(?:(\d{1,2})[/-])??(?:(\d{1,2})[/-])?(\d{4})$/;

  @restartableTask
  *debouncedSetFilter(event) {
    yield timeout(500);
    this.setFilter(event.target.value);
  }

  @action
  setFilter(date) {
    if (this.dateRegex.test(date)) {
      this.filter = date;
      this.page = 0;
    } else if (date === '' && this.filter) {
      this.filter = null;
      this.page = 0;
    }
  }

  @action
  clearFilter() {
    this.filter = null;
    this.page = 0;
  }

  @action
  openNewSessionModal() {
    this.isCreatingNewSession = true;
    // because we use the EditMeetingModal to create and edit a meeting,
    //  in order to allow genericity inside the component, x-publication-activities are created before opening
    this.newInternalDecisionPublicationActivity = this.store.createRecord(
      'internal-decision-publication-activity',
      {}
    );
    this.newInternalDocumentPublicationActivity = this.store.createRecord(
      'internal-document-publication-activity',
      {}
    );
    this.newThemisPublicationActivity = this.store.createRecord(
      'themis-publication-activity',
      {
        scope: AgendaPublicationUtils.THEMIS_PUBLICATION_SCOPE_PLANNED,
      }
    );
    this.newMeeting = this.store.createRecord('meeting', {
      isFinal: false,
      internalDecisionPublicationActivity: this.newInternalDecisionPublicationActivity,
      internalDocumentPublicationActivity: this.newInternalDocumentPublicationActivity,
      themisPublicationActivities: [this.newThemisPublicationActivity],
    });
  }

  @action
  closeNewSessionModal() {
    this.isCreatingNewSession = false;
    this.newMeeting.deleteRecord();
    this.newInternalDocumentPublicationActivity.deleteRecord();
    this.newInternalDecisionPublicationActivity.deleteRecord();
    this.newThemisPublicationActivity.deleteRecord();
  }

  @action
  async createAgendaAndNewsletter() {
    await Promise.all([
      this.newInternalDecisionPublicationActivity.save(),
      this.newInternalDocumentPublicationActivity.save(),
      this.newThemisPublicationActivity.save(),
    ]);
    const agenda = await this.createAgenda(this.newMeeting);

    const closestMeeting = await this.store.queryOne('meeting', {
      filter: {
        ':lt:planned-start': this.newMeeting.plannedStart.toISOString(),
        kind: {
          ':has-no:broader': true,
        },
      },
      sort: '-planned-start',
    });
    const kind = await this.newMeeting.kind;
    const broader = await kind?.broader;
    const isAnnexMeeting = broader?.uri === CONSTANTS.MEETING_KINDS.ANNEX;
    if (!isAnnexMeeting && closestMeeting) {
      await this.createAgendaitemToApproveMinutes(
        agenda,
        this.newMeeting,
        closestMeeting
      );
    }
    await this.newsletterService.createNewsItemForMeeting(this.newMeeting);
    this.isCreatingNewSession = false;
    this.send('refreshRoute');
    this.router.transitionTo('agendas');
  }

  @action
  async onClickRow(agenda) {
    const meeting = await agenda.createdFor;
    this.router.transitionTo('agenda.agendaitems', meeting.id, agenda.id);
  }

  @action
  sortTable(sortField) {
    this.sort = sortField;
  }

  @action
  setSizeOption(size) {
    this.size = size;
    this.page = 0;
  }

  @action
  nextPage() {
    this.page = this.page + 1;
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
    }
  }

  async createAgenda(meeting) {
    const now = new Date();
    const status = await this.store.findRecordByUri(
      'agendastatus',
      CONSTANTS.AGENDA_STATUSSES.DESIGN
    );
    const agenda = this.store.createRecord('agenda', {
      serialnumber: 'A',
      title: `Agenda A voor zitting ${moment(meeting.plannedStart).format(
        'D-M-YYYY'
      )}`,
      createdFor: meeting,
      status,
      created: now,
      modified: now,
    });
    await agenda.save();
    return agenda;
  }

  async createAgendaitemToApproveMinutes(agenda, newMeeting, closestMeeting) {
    const now = new Date();

    const decisionResultCode = await this.store.findRecordByUri(
      'decision-result-code',
      CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
    );

    const startDate = newMeeting.plannedStart;
    const agendaItemTreatment = this.store.createRecord(
      'agenda-item-treatment',
      {
        created: now,
        modified: now,
        startDate: startDate,
        decisionResultCode,
      }
    );
    await agendaItemTreatment.save();

    const agendaitem = this.store.createRecord('agendaitem', {
      created: now,
      agenda,
      number: 1,
      shortTitle: `Goedkeuring van het verslag van de vergadering van ${moment(
        closestMeeting.plannedstart
      ).format('dddd DD-MM-YYYY')}`,
      formallyOk: CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK,
      isApproval: true,
      treatments: A([agendaItemTreatment]),
    });
    await agendaitem.save();
    return agendaitem;
  }
}
