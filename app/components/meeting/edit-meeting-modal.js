import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task, dropTask } from 'ember-concurrency';
import { isPresent } from '@ember/utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import addBusinessDays from 'date-fns/addBusinessDays';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';
import { deleteFile } from 'frontend-kaleidos/utils/document-delete-helpers';

/**
 * @argument {isNew}
 * @argument {meeting}
 * @argument {didSave}
 * @argument {onCancel}
 */
export default class MeetingEditMeetingComponent extends Component {
  @service store;
  @service toaster;
  @service mandatees;

  @tracked isAnnexMeeting = false;
  @tracked isEditingNumberRepresentation = false;
  @tracked isNew = false;
  @tracked isDisabledPlannedDocumentPublicationDate = false;

  @tracked selectedKind;
  @tracked selectedMainMeeting;
  @tracked startDate;
  @tracked decisionPublicationActivity;
  @tracked documentPublicationActivity;
  @tracked themisPublicationActivity;
  @tracked plannedDocumentPublicationDate;
  @tracked secretary;
  @tracked extraInfo;
  @tracked _meetingNumber;
  @tracked _numberRepresentation;

  visibleRoles = [
    CONSTANTS.MANDATE_ROLES.SECRETARIS,
    CONSTANTS.MANDATE_ROLES.WAARNEMEND_SECRETARIS,
  ];

  currentYear = new Date().getFullYear();

  constructor() {
    super(...arguments);
    this.isNew = this.args.meeting.isNew;

    this.initializeKind.perform();
    this.initializeMeetingNumber.perform();
    this.initializeMainMeeting.perform();
    this.initializePublicationModels.perform();
    this.loadSecretary.perform();

    this.meetingYear =
      this.args.meeting.plannedStart?.getFullYear() || this.currentYear;
    this.startDate = this.args.meeting.plannedStart;
    this.extraInfo = this.args.meeting.extraInfo;
    this.numberRepresentation = this.args.meeting.numberRepresentation;
  }

  get meetingKindPostfix() {
    return this.selectedKind?.uri === CONSTANTS.MEETING_KINDS.PVV ? 'VV' : '';
  }

  get numberRepresentation() {
    return (
      this._numberRepresentation ??
      `VR PV ${this.meetingYear}/${this.meetingNumber}`
    );
  }

  set numberRepresentation(numberRepresentation) {
    this._numberRepresentation = numberRepresentation;
  }

  get meetingNumber() {
    return this._meetingNumber;
  }

  set meetingNumber(meetingNumber) {
    this._meetingNumber = meetingNumber;
    if (meetingNumber) {
      this._numberRepresentation = null;
    }
  }

  get savingIsDisabled() {
    return (
      (this.isAnnexMeeting && !this.selectedMainMeeting) ||
      !this.meetingNumber ||
      !this.numberRepresentation ||
      this.initializeKind.isRunning ||
      this.initializeMainMeeting.isRunning ||
      this.saveMeeting.isRunning
    );
  }

  get cancelIsDisabled() {
    return this.saveMeeting.isRunning;
  }

  @action
  setStartDate(date) {
    this.startDate = date;
    if (!this.isDisabledPlannedDocumentPublicationDate) {
      const nextBusinessDay = setMinutes(
        setHours(addBusinessDays(date, 1), 14),
        0
      );
      this.plannedDocumentPublicationDate = nextBusinessDay;
    }
  }

  loadSecretary = task(async () => {
    const secretary = await this.args.meeting.secretary;
    if (isPresent(secretary)) {
      this.secretary = secretary;
    } else {
      const currentApplicationSecretary =
        await this.mandatees.getCurrentApplicationSecretary();
      this.secretary = currentApplicationSecretary;
    }
  });

  @task
  *initializeMainMeeting() {
    this.selectedMainMeeting = yield this.args.meeting.mainMeeting;
  }

  @task
  *initializeKind() {
    this.selectedKind = yield this.args.meeting.kind;
    this.selectedKind ??= yield this.store.findRecordByUri(
      'concept',
      CONSTANTS.MEETING_KINDS.MINISTERRAAD
    );
    const broader = yield this.selectedKind?.broader;
    this.isAnnexMeeting = broader?.uri === CONSTANTS.MEETING_KINDS.ANNEX;
  }

  @dropTask
  *initializeMeetingNumber() {
    if (this.args.meeting.number) {
      this.meetingNumber = this.args.meeting.number;
    } else {
      const meeting = yield this.store.queryOne('meeting', {
        filter: {
          ':gte:planned-start': new Date(this.currentYear, 0, 1).toISOString(),
          ':lt:planned-start': new Date(
            this.currentYear + 1,
            0,
            1
          ).toISOString(),
        },
        sort: '-number',
      });

      const id = meeting?.number ?? 0;
      this.meetingNumber = id + 1;
    }
  }

  @task
  *initializePublicationModels() {
    if (this.isNew) {
      this.decisionPublicationActivity = yield this.args.meeting
        .internalDecisionPublicationActivity;
      this.documentPublicationActivity = yield this.args.meeting
        .internalDocumentPublicationActivity;
      const themisPublicationActivities = yield this.args.meeting
        .themisPublicationActivities;
      this.themisPublicationActivity = themisPublicationActivities.firstObject;
    } else {
      // Ensure we get fresh data to avoid concurrency conflicts
      this.decisionPublicationActivity = yield this.args.meeting
        .belongsTo('internalDecisionPublicationActivity')
        .reload();
      this.documentPublicationActivity = yield this.args.meeting
        .belongsTo('internalDocumentPublicationActivity')
        .reload();
      // Documents can be published multiple times to Themis.
      // We're only interested in the first (earliest) publication of documents.
      this.themisPublicationActivity = yield this.store.queryOne(
        'themis-publication-activity',
        {
          'filter[meeting][:uri:]': this.args.meeting.uri,
          'filter[scope]': CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS,
          sort: 'planned-date',
          include: 'status',
        }
      );
    }

    // Get the planned date from existing data. We could get this from either document
    // or Themis publication activity, but both should be equal at this point
    this.plannedDocumentPublicationDate =
      this.documentPublicationActivity.plannedDate;

    const documentPublicationStatuses = yield Promise.all([
      this.documentPublicationActivity.status,
      this.themisPublicationActivity.status,
    ]);
    // If either internal documents or Themis documents activies have already been
    // confirmed/released, the planned date should no longer be editable
    this.isDisabledPlannedDocumentPublicationDate =
      documentPublicationStatuses.some(
        (status) => status.uri != CONSTANTS.RELEASE_STATUSES.PLANNED
      );
  }

  exportPdf = task(async (report) => {
    const resp = await fetch(`/generate-decision-report/${report.id}`);
    if (!resp.ok) {
      this.toaster.error(this.intl.t('error-while-exporting-pdf'));
      return;
    }
    return await resp.json();
  });

  async replaceReportFile(report, fileId) {
    await deleteFile(report.file);
    const file = await this.store.findRecord('file', fileId);
    report.file = file;
    report.modified = new Date();
    await report.save();
  }

  @dropTask
  *saveMeeting() {
    const now = new Date();

    this.args.meeting.extraInfo = this.extraInfo;
    this.args.meeting.secretary = this.secretary;
    this.args.meeting.plannedStart = this.startDate || now;
    this.args.meeting.kind = this.selectedKind;
    this.args.meeting.number = this.meetingNumber;
    this.args.meeting.numberRepresentation = this.numberRepresentation;
    this.args.meeting.mainMeeting = this.selectedMainMeeting;

    if (this.args.meeting.secretary != this.secretary) {
      const decisionActivities = yield this.store.queryAll('decision-activity', {
        'filter[treatment][agendaitems][agenda][created-for][:id:]':
          this.args.meeting.id,
      });
      for (let decisionActivity of decisionActivities.slice()) {
        decisionActivity.secretary = this.secretary;
        yield decisionActivity.save(); 
        const report = yield this.store.queryOne('report', {
          'filter[:has-no:next-piece]': true,
          'filter[decision-activity][:id:]': decisionActivity.id,
        });
        if (report) {
          const fileMeta = yield this.exportPdf.perform(report);
          yield this.replaceReportFile(report, fileMeta.id);
        }
      }
    }
    // update the planned date of the publication activities (not needed for decisions)
    this.themisPublicationActivity.plannedDate =
      this.plannedDocumentPublicationDate;
    this.documentPublicationActivity.plannedDate =
      this.plannedDocumentPublicationDate;

    try {
      yield this.args.meeting.save();
      const saveActivities = [
        this.themisPublicationActivity.save(),
        this.documentPublicationActivity.save(),
      ];
      if (this.decisionPublicationActivity.isNew) {
        saveActivities.push(this.decisionPublicationActivity.save());
      }
      yield Promise.all(saveActivities);
    } catch (err) {
      console.error(err);
      this.toaster.error();
    } finally {
      yield this.args.didSave();
    }
  }

  filterMainMeetingResults(meeting, results) {
    return results.filter((result) => result.id != meeting.id);
  }

  @action
  selectMainMeeting(mainMeeting) {
    this.selectedMainMeeting = mainMeeting;
    this.meetingNumber = mainMeeting.number;
    this.numberRepresentation = `${mainMeeting.numberRepresentation}-${this.meetingKindPostfix}`;
    this.startDate = mainMeeting.plannedStart;
    if (!this.isDisabledPlannedDocumentPublicationDate) {
      const nextBusinessDay = setMinutes(
        setHours(addBusinessDays(this.startDate, 1), 14),
        0
      );
      this.plannedDocumentPublicationDate = nextBusinessDay;
    }
    this.extraInfo = mainMeeting.extraInfo;
    this.secretary = mainMeeting.secretary;
  }

  @action
  async selectKind(kind) {
    this.selectedKind = kind;

    const broader = await this.selectedKind?.broader;
    this.isAnnexMeeting = broader?.uri === CONSTANTS.MEETING_KINDS.ANNEX;

    if (!this.isAnnexMeeting) {
      this.selectedMainMeeting = null;
      this.initializeMeetingNumber.perform();
    }
  }

  @action
  toggleEditingNumberRepresentation() {
    this.isEditingNumberRepresentation = !this.isEditingNumberRepresentation;
  }
}
