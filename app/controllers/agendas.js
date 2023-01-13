import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import moment from 'moment';
import { restartableTask, timeout } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import addBusinessDays from 'date-fns/addBusinessDays';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';
const DEFAULT_SORT_OPTIONS = ['-created-for.agenda.status.label', '-created-for.planned-start', 'created-for.kind.label'];
export default class AgendasController extends Controller {
  queryParams = ['pageAgendas', 'sizeAgendas', 'sortAgendas', 'filterAgendas'];

  @service store;
  @service currentSession;
  @service router;

  defaultPublicationActivityStatus;
  @tracked newMeeting;
  @tracked publicationActivities = [];

  @tracked isLoadingModel = false;
  @tracked isCreatingNewSession = false;
  @tracked filterAgendas = null;
  @tracked pageAgendas = 0;
  @tracked sizeAgendas = 10;
  @tracked sortField;
  @tracked sortAgendas = DEFAULT_SORT_OPTIONS.join(',');

  dateRegex = /^(?:(\d{1,2})[/-])??(?:(\d{1,2})[/-])?(\d{4})$/;

  @restartableTask
  *debouncedSetFilter(event) {
    yield timeout(500);
    this.setFilter(event.target.value);
  }

  @action
  setFilter(date) {
    if (this.dateRegex.test(date)) {
      this.filterAgendas = date;
      this.pageAgendas = 0;
    } else if (date === '' && this.filterAgendas) {
      this.filterAgendas = null;
      this.pageAgendas = 0;
    }
  }

  @action
  clearFilter() {
    this.filterAgendas = null;
    this.pageAgendas = 0;
  }

  @action
  openNewSessionModal() {
    const now = new Date();
    const plannedStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    this.newMeeting = this.store.createRecord('meeting', {
      plannedStart
    });
    const nextBusinessDay = setMinutes(setHours(addBusinessDays(plannedStart, 1), 14), 0);
    this.publicationActivities = [
      this.store.createRecord('internal-decision-publication-activity', {
        meeting: this.newMeeting,
        status: this.defaultPublicationActivityStatus
      }),
      this.store.createRecord('internal-document-publication-activity', {
        meeting: this.newMeeting,
        status: this.defaultPublicationActivityStatus,
        plannedDate: nextBusinessDay
      }),
      this.store.createRecord('themis-publication-activity', {
        meeting: this.newMeeting,
        status: this.defaultPublicationActivityStatus,
        plannedDate: nextBusinessDay,
        scope: [
          CONSTANTS.THEMIS_PUBLICATION_SCOPES.NEWSITEMS,
          CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS,
        ]
      }),
    ];

    this.isCreatingNewSession = true;
  }

  @action
  closeNewSessionModal() {
    this.isCreatingNewSession = false;
    this.newMeeting.deleteRecord();
    this.publicationActivities.forEach((activity) => activity.deleteRecord());
  }

  @action
  async createNewSession() {
    const agenda = await this.createAgenda(this.newMeeting);

    const closestMeeting = await this.store.queryOne('meeting', {
      filter: {
        ':lt:planned-start': this.newMeeting.plannedStart.toISOString(),
        kind: {
          ':has-no:broader': true,
        }
      },
      sort: '-planned-start',
    });
    const kind = await this.newMeeting.kind;
    const isRegularMeeting = kind.uri === CONSTANTS.MEETING_KINDS.MINISTERRAAD;
    // Only a regular meeting should get an approval agendaitem
    if (isRegularMeeting && closestMeeting) {
      await this.createAgendaitemToApproveMinutes(
        agenda,
        this.newMeeting,
        closestMeeting
      );
    }
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
    this.sortField = sortField;
    // if only 1 field is sorted, the other sort priorities don't work anymore. So append the defaults after the sortField
    let newSortAgendas = sortField || DEFAULT_SORT_OPTIONS.join(',');
    for (const sortOption of DEFAULT_SORT_OPTIONS) {
      if (newSortAgendas.replace(/-/g, '').indexOf(sortOption.replace(/-/g, '')) === -1) {
        newSortAgendas += ',' + sortOption
      }
    }
    this.sortAgendas = newSortAgendas;
  }

  @action
  setSizeOption(size) {
    this.sizeAgendas = size;
    this.pageAgendas = 0;
  }

  @action
  nextPage() {
    this.pageAgendas = this.pageAgendas + 1;
  }

  @action
  prevPage() {
    if (this.pageAgendas > 0) {
      this.pageAgendas = this.pageAgendas - 1;
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
      modified: now
    });
    await agenda.save();
    return agenda;
  }

  async createAgendaitemToApproveMinutes(agenda, newMeeting, closestMeeting) {
    const now = new Date();

    const decisionResultCode = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
    );

    const startDate = newMeeting.plannedStart;
    const decisionActivity = this.store.createRecord(
      'decision-activity',
      {
        startDate: startDate,
        decisionResultCode
        // no subcase. Minutes approval aren't part of a (sub)case
      }
    );
    await decisionActivity.save();

    const agendaItemTreatment = this.store.createRecord(
      'agenda-item-treatment',
      {
        created: now,
        modified: now,
        decisionActivity
      }
    );
    await agendaItemTreatment.save();

    const notaType = await this.store.findRecordByUri('concept', CONSTANTS.AGENDA_ITEM_TYPES.NOTA);
    const agendaitem = this.store.createRecord('agendaitem', {
      created: now,
      agenda,
      number: 1,
      shortTitle: `Goedkeuring van het verslag van de vergadering van ${moment(
        closestMeeting.plannedstart
      ).format('dddd DD-MM-YYYY')}`,
      formallyOk: CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK,
      isApproval: true,
      treatment: agendaItemTreatment,
      type: notaType
    });
    await agendaitem.save();
    return agendaitem;
  }
}
