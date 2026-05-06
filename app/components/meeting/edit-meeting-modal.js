import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { addBusinessDays, setHours, setMinutes } from 'date-fns';
import { KALEIDOS_START_DATE } from 'frontend-kaleidos/config/config';
import { replaceBySectionId } from 'frontend-kaleidos/utils/html-utils';
import CONFIG from 'frontend-kaleidos/utils/config';

function replaceSecretary(htmlString, newSecretary, newSecretaryTitle) {
  let newHtml = replaceBySectionId(htmlString, 'secretary-title', `<p>De ${newSecretaryTitle}</p>`);
  return replaceBySectionId(newHtml, 'secretary', `<p>${newSecretary}</p>`);
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
  @service intl;
  @service router;
  @service documentService;

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
    this.initializeMeetingNumber.perform(true);
    this.recalculateSecretary.perform(); // when selecting a range with possibly different secretary mandatees
  }

  initializeSecretary = task(async () => {
    if (!this.isPreKaleidos) {
      const secretary = await this.args.meeting.secretary;
      if (isPresent(secretary)) {
        this.secretary = secretary;
      } else if (this.isNew) {
        const currentApplicationSecretary =
          await this.mandatees.getApplicationSecretary();
        this.secretary = currentApplicationSecretary;
      }
      // if a meeting had no secretary yet we don't set the current active default one automatically
    }
  });

  recalculateSecretary = task(async () => {
    // check if the secretary is active on the agenda date unless no secretary was set
    if (!this.isPreKaleidos && this.secretary?.id) {
      const isInDateRange =
      this.secretary.start <= this.startDate &&
      (this.startDate <= this.secretary.end ||
        this.secretary.end === undefined);

      if (!isInDateRange) {
        // selected secretary is not active for this agenda date, trying to find one in range
        const applicationSecretaryForDate =
          await this.mandatees.getApplicationSecretary(this.startDate);
        this.secretary = applicationSecretaryForDate;
      }
    }
  });

  initializeMainMeeting = task(async () => {
    this.selectedMainMeeting = await this.args.meeting.mainMeeting;
  });

  initializeKind = task(async () => {
    this.selectedKind = await this.args.meeting.kind;
    this.selectedKind ??= await this.store.findRecordByUri(
      'concept',
      CONSTANTS.MEETING_KINDS.MINISTERRAAD
    );
    const broader = await this.selectedKind?.broader;
    this.isAnnexMeeting = broader?.uri === CONSTANTS.MEETING_KINDS.ANNEX;
  });

  initializeMeetingNumber = task({ drop: true }, async (startDateChanged) => {
    if (this.args.meeting.number) {
      this.meetingNumber = this.args.meeting.number;
    } else {
      let selectedYear = this.currentYear;
      if (startDateChanged) {
        selectedYear = this.startDate?.getFullYear() || this.currentYear;
        this.meetingYear = selectedYear; // only numberRepresentation getter uses meetingYear
      }
      const meeting = await this.store.queryOne('meeting', {
        filter: {
          ':gte:planned-start': new Date(selectedYear, 0, 1).toISOString(),
          ':lt:planned-start': new Date(
            selectedYear + 1,
            0,
            1
          ).toISOString(),
        },
        sort: '-number',
      });

      const id = meeting?.number ?? 0;
      this.meetingNumber = id + 1;
    }
  });

  initializePublicationModels = task(async () => {
    if (this.isNew) {
      this.decisionPublicationActivity = await this.args.meeting
        .internalDecisionPublicationActivity;
      this.documentPublicationActivity = await this.args.meeting
        .internalDocumentPublicationActivity;
      const themisPublicationActivities = await this.args.meeting
        .themisPublicationActivities;
      this.themisPublicationActivity = themisPublicationActivities.at(0);
    } else {
      // Ensure we get fresh data to avoid concurrency conflicts
      this.decisionPublicationActivity = await this.args.meeting
        .belongsTo('internalDecisionPublicationActivity')
        .reload();
      this.documentPublicationActivity = await this.args.meeting
        .belongsTo('internalDocumentPublicationActivity')
        .reload();
      // Documents can be published multiple times to Themis.
      // We're only interested in the first (earliest) publication of documents.
      this.themisPublicationActivity = await this.store.queryOne(
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

    const documentPublicationStatuses = await Promise.all([
      this.documentPublicationActivity.status,
      this.themisPublicationActivity.status,
    ]);
    // If either internal documents or Themis documents activies have already been
    // confirmed/released, the planned date should no longer be editable
    this.isDisabledPlannedDocumentPublicationDate =
      documentPublicationStatuses.some(
        (status) => status.uri != CONSTANTS.RELEASE_STATUSES.PLANNED
      );
  });

  saveMeeting = task(async () => {
    const now = new Date();

    const currentMeetingSecretary = await this.args.meeting.secretary;
    const currentKind = await this.args.meeting.kind;
    const currentPlannedStart = this.args.meeting.plannedStart;
    const currentMeetingNumberRepresentation = this.args.meeting.numberRepresentation;

    this.args.meeting.extraInfo = this.extraInfo;
    this.args.meeting.plannedStart = this.startDate || now;
    this.args.meeting.kind = this.selectedKind;
    this.args.meeting.number = this.meetingNumber;
    this.args.meeting.numberRepresentation = this.numberRepresentation;
    this.args.meeting.mainMeeting = this.selectedMainMeeting;

    if (!this.isPreKaleidos) {
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
      await this.args.meeting.save();
      const saveActivities = [
        this.themisPublicationActivity.save(),
        this.documentPublicationActivity.save(),
      ];
      if (this.decisionPublicationActivity.isNew) {
        saveActivities.push(this.decisionPublicationActivity.save());
      }

      // Check if an annex meeting exists, if so update its planned start
      const annexMeeting = await this.store.queryOne('meeting', {
        filter: {
          'main-meeting': {
            ':id:': this.args.meeting.id,
          }
        }
      });
      if (annexMeeting?.id) {
        // these 2 properties cannot be changed on the annex meeting
        annexMeeting.plannedStart = this.args.meeting.plannedStart;
        annexMeeting.number = this.args.meeting.number;
        // numberRepresentation still needs to be updated manually and will trigger new reports/minutes
        saveActivities.push(annexMeeting.save());
      }

      await Promise.all(saveActivities);

      if (annexMeeting?.id) {
        this.toaster.success(this.intl.t('annex-meeting-was-saved',
          { title: annexMeeting.numberRepresentation }),
          null,
          {
            timeOut: 30000,
            closable: true,
          }
        );
      }

      if (!this.isPreKaleidos || !this.isNew) {
        if (
          currentMeetingSecretary?.uri !== this.secretary?.uri ||
          currentKind?.uri !== this.selectedKind.uri ||
          (currentPlannedStart.getDate() !== this.startDate.getDate() ||
          currentPlannedStart.getMonth() !== this.startDate.getMonth() ||
          currentPlannedStart.getFullYear() !== this.startDate.getFullYear()) ||

          currentMeetingNumberRepresentation !== this.numberRepresentation
        ) {
          if (currentMeetingSecretary?.uri !== this.secretary?.uri) {
            const decisionActivities = await this.store.queryAll(
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
            await Promise.all(
              decisionActivities.map(async (decisionActivity) => {
                decisionActivity.secretary = this.secretary;
                await decisionActivity.save();
              })
            );
          }
          let regenerateReportNames = false;
          if (currentMeetingNumberRepresentation !== this.numberRepresentation) {
            regenerateReportNames = true;
          }

          let agendaitemsToRegenerateConcernFor = null;
          if (currentPlannedStart.getDate() !== this.startDate.getDate() ||
            currentPlannedStart.getMonth() !== this.startDate.getMonth() ||
            currentPlannedStart.getFullYear() !== this.startDate.getFullYear()
          ) {
            // only approved agendaitem does not cover BIS documents.
            // but BIS documents via submission will only be stamped (will they?) on agenda approval
            // BIS added by secretarie gets stamped immediately
            // this is only for regenerating the decisions, so new agendaitems don't need to count
            const lastApprovedAgenda = await this.store.queryOne('agenda', {
              'filter[created-for][:id:]': this.args.meeting.id,
              'filter[status][:uri:]': CONSTANTS.AGENDA_STATUSSES.APPROVED,
              sort: '-created',
            });
            if (lastApprovedAgenda) {
              const approvedAgendaItems = await this.store.queryAll('agendaitem', {
                'filter[agenda][:id:]': lastApprovedAgenda.id,
                'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.APPROVED,
              });
              await this.documentService.renamePiecesOfMeeting(this.args.meeting.id, currentPlannedStart, this.startDate);
              agendaitemsToRegenerateConcernFor = [...new Set(approvedAgendaItems?.map((agendaitem) => agendaitem.id))];
            }
          }
          await this.decisionReportGeneration.regenerateDecisionReportsForMeeting.perform(this.args.meeting, regenerateReportNames, agendaitemsToRegenerateConcernFor);
          await this.regenerateMinutes();
        }
      }
    } catch (err) {
      console.error(err);
      this.toaster.error();
    } finally {
      await this.args.didSave();
    }
  });

  async regenerateMinutes() {
    const minutes = await this.args.meeting.minutes;
    if (minutes) {
      if (! (await this.decisionReportGeneration.canReplaceMinutes(minutes))) {
        this.toaster.error(
          this.intl.t('minutes-cannot-be-altered')
        );
        return;
      }
      // new name
      const documentContainer = await minutes.documentContainer;
      const pieces = await documentContainer.pieces;
      let versionSuffix = '';
      if (pieces >= 1 && pieces < Object.keys(CONFIG.latinAdverbialNumberals).length) {
        versionSuffix = CONFIG.latinAdverbialNumberals[pieces].toUpperCase();
      }
      minutes.name = `${this.args.meeting.numberRepresentation}${versionSuffix}`;
      await minutes.save();
      // replace secretary
      const piecePart = await this.store.queryOne('piece-part', {
        'filter[:has-no:next-piece-part]': true,
        'filter[minutes][:id:]': minutes.id,
      });
      if (this.secretary) {
        const newHtmlContent = replaceSecretary(piecePart.htmlContent,
          this.secretary.person.get('fullName'),
          this.secretary.title.toLowerCase());
        piecePart.htmlContent = newHtmlContent;
      }
      await piecePart.save();
      // new file
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
    const mainMeetingSecretary = await mainMeeting.secretary;
    if (mainMeetingSecretary) {
      this.secretary = mainMeetingSecretary;
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
