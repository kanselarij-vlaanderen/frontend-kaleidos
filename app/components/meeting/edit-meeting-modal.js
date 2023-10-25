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
import ENV from 'frontend-kaleidos/config/environment';
import { KALEIDOS_START_DATE } from 'frontend-kaleidos/config/config';
import { replaceById } from 'frontend-kaleidos/utils/html-utils';

function replaceSecretary(htmlString, newSecretary, newSecretaryTitle) {
  let newHtml = replaceById(htmlString, 'secretary-title', newSecretaryTitle);
  return replaceById(newHtml, 'secretary', `<p>${newSecretary}</p>`);
}

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
  @service decisionReportGeneration;

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

    this.meetingYear =
      this.args.meeting.plannedStart?.getFullYear() || this.currentYear;
    this.startDate = this.args.meeting.plannedStart;
    this.extraInfo = this.args.meeting.extraInfo;
    this.numberRepresentation = this.args.meeting.numberRepresentation;

    // computation issue with startDate if performed before
    this.initializeSecretary.perform();
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
      this.initializeSecretary.isRunning ||
      this.initializePublicationModels.isRunning ||
      this.initializeMeetingNumber.isRunning ||
      this.saveMeeting.isRunning
    );
  }

  get cancelIsDisabled() {
    return this.saveMeeting.isRunning;
  }

  get enableDigitalAgenda() {
    return (
      ENV.APP.ENABLE_DIGITAL_AGENDA === 'true' ||
      ENV.APP.ENABLE_DIGITAL_AGENDA === true
    );
  }

  get enableDigitalMinutes() {
    return (
      ENV.APP.ENABLE_DIGITAL_MINUTES === 'true' ||
      ENV.APP.ENABLE_DIGITAL_MINUTES === true
    );
  }

  get isPreKaleidos() {
    return this.startDate < KALEIDOS_START_DATE;
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

  initializeSecretary = task(async () => {
    if (this.enableDigitalAgenda && !this.isPreKaleidos) {
      const secretary = await this.args.meeting.secretary;
      if (isPresent(secretary)) {
        this.secretary = secretary;
      } else if (this.isNew) {
        // if a meeting had no secretary yet we don't set a default one automatically
        const currentApplicationSecretary =
          await this.mandatees.getCurrentApplicationSecretary();
        this.secretary = currentApplicationSecretary;
      }
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

  regenerateDecisionReports = task(async () => {
    const reports = await this.store.queryAll('report', {
      'filter[:has-no:next-piece]': true,
      'filter[:has:piece-parts]': true,
      'filter[decision-activity][treatment][agendaitems][agenda][created-for][:id:]':
        this.args.meeting.id,
    });
    if (reports.length) {
      this.decisionReportGeneration.generateReplacementReports.perform(reports);
    }
  });

  @task
  *saveMeeting() {
    const now = new Date();

    const currentMeetingSecretary = yield this.args.meeting.secretary;
    const currentKind = yield this.args.meeting.kind;
    const currentPlannedStart = this.args.meeting.plannedStart;
    const currentMeetingNumberRepresentation = this.args.meeting.numberRepresentation;

    this.args.meeting.extraInfo = this.extraInfo;
    this.args.meeting.plannedStart = this.startDate || now;
    this.args.meeting.kind = this.selectedKind;
    this.args.meeting.number = this.meetingNumber;
    this.args.meeting.numberRepresentation = this.numberRepresentation;
    this.args.meeting.mainMeeting = this.selectedMainMeeting;

    if (this.enableDigitalAgenda && !this.isPreKaleidos) {
      if (currentMeetingSecretary?.uri !== this.secretary?.uri) {
        this.args.meeting.secretary = this.secretary;
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
      if (this.enableDigitalAgenda && !this.isPreKaleidos) {
        if (
          currentMeetingSecretary?.uri !== this.secretary?.uri ||
          currentKind?.uri !== this.selectedKind.uri ||
          currentPlannedStart !== this.startDate ||
          currentMeetingNumberRepresentation !== this.numberRepresentation
        ) {
          if (currentMeetingSecretary?.uri !== this.secretary?.uri) {
            const decisionActivities = yield this.store.queryAll(
              'decision-activity',
              {
                'filter[treatment][agendaitems][agenda][created-for][:id:]':
                  this.args.meeting.id,
              }
            );
            // TODO KAS-4293 secretary only needs to be updated if that changes
            // if so, all decisionActivities have to be saved before we generate the reports again.
            // any chance we can set the secretary in backend and reload in frontend?
            // we might have some concurrency issues here with every save of decisionActivity
            yield Promise.all(
              decisionActivities.map(async (decisionActivity) => {
                decisionActivity.secretary = this.secretary;
                await decisionActivity.save();
              })
            );
          }
          yield this.regenerateDecisionReports.perform();
          if (this.enableDigitalMinutes) {
            yield this.updateSecretaryInMinutes();
          }
        }
      }
    } catch (err) {
      console.error(err);
      this.toaster.error();
    } finally {
      yield this.args.didSave();
    }
  }

  async updateSecretaryInMinutes() {
    const minutes = await this.args.meeting.minutes;
    if (minutes) {
      const piecePart = await this.store.queryOne('piece-part', {
        'filter[:has-no:next-piece-part]': true,
        'filter[minutes][:id:]': minutes.id,
      });
      const newHtmlContent = replaceSecretary(piecePart.htmlContent,
        this.secretary.person.get('fullName'),
        this.secretary.title.toLowerCase());
      piecePart.htmlContent = newHtmlContent;
      await piecePart.save();
      this.decisionReportGeneration.generateReplacementMinutes.perform(
        minutes,
      );
    }
  }

  filterMainMeetingResults(meeting, results) {
    return results.filter((result) => result.id != meeting.id);
  }

  @action
  async selectMainMeeting(mainMeeting) {
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
    if (this.enableDigitalAgenda) {
      const mainMeetingSecretary = await mainMeeting.secretary;
      if (mainMeetingSecretary) {
        this.secretary = mainMeetingSecretary;
      }
    }
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
