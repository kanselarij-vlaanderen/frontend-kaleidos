import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import constants from 'frontend-kaleidos/config/constants';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import VrNotulenName,
{ compareFunction as compareNotulen } from 'frontend-kaleidos/utils/vr-notulen-name';
import { generateBetreft, generateApprovalText } from 'frontend-kaleidos/utils/decision-minutes-formatting';
import generateReportName from 'frontend-kaleidos/utils/generate-report-name';
import { addWeeks } from 'date-fns';

function renderAttendees(attendees) {
  const { primeMinister, viceMinisters, ministers, secretary } = attendees;
  let secretaryTitle = secretary?.title.toLowerCase() || 'secretaris';
  return `
    <p><u>AANWEZIG</u></p>
    <table id="attendees">
      <tbody>
        <tr>
          <td>De minister-president</td>
          <td>${primeMinister}</td>
        </tr>
        <tr>
          <td>De viceminister-presidenten</td>
          <td>${viceMinisters.join('<br/>')}</td>
        </tr>
        <tr>
          <td>De Vlaamse ministers</td>
          <td>${ministers.join('<br/>')}</td>
        </tr>
        <tr>
          <td>De <span id="secretary-title">${secretaryTitle}</span></td>
          <td><span id="secretary">${mandateeName(secretary)}</span></td>
        </tr>
      </tbody>
    </table>
  `;
}

async function renderNotas(meeting, notas, intl, store) {
  return `
  <section data-section="agendaitems">
  ${await renderAgendaitemList(meeting, notas, intl, store)}
  </section>
  `;
}

async function renderAnnouncements(meeting, announcements, intl, store) {
  return `
  <section data-section="announcements">
    <h4><u>MEDEDELINGEN</u></h4>
    ${await renderAgendaitemList(meeting, announcements, intl, store)}
  </section>
  `;
}

async function renderAgendaitemList(meeting, agendaitems, intl, store) {
  let agendaitemList = "";
  for (const agendaitem of agendaitems) {
    agendaitemList += await getMinutesListItem(meeting, agendaitem, intl, store);
  }
  return agendaitemList;
}
async function getMinutesListItem(meeting, agendaitem, intl, store) {
  const treatment = await agendaitem.treatment;
  const decisionActivity = await treatment?.decisionActivity;
  const decisionResultCode = await decisionActivity?.decisionResultCode;
  let text = "";
  if (agendaitem.isApproval) {
    text = generateApprovalText(agendaitem.shortTitle, agendaitem.title);
  } else {
    let mededelingOrNota = "";
    if (agendaitem.type?.get('uri') === constants.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
      mededelingOrNota = "deze mededeling";
    } else {
      mededelingOrNota = "dit punt";
    }
    switch (decisionResultCode?.uri) {
      case constants.DECISION_RESULT_CODE_URIS.GOEDGEKEURD:
        text = intl.t("minutes-approval", {
          mededelingOrNota: capitalizeFirstLetter(mededelingOrNota),
          reportName: await generateReportName(agendaitem, meeting),
        })
        break;
      case constants.DECISION_RESULT_CODE_URIS.INGETROKKEN:
        text = intl.t("minutes-retracted", {
          mededelingOrNota: capitalizeFirstLetter(mededelingOrNota)
        })
        break;
      case constants.DECISION_RESULT_CODE_URIS.KENNISNAME:
        text = intl.t("minutes-acknowledged", {
          mededelingOrNota: mededelingOrNota
        })
        break;
      case constants.DECISION_RESULT_CODE_URIS.UITGESTELD:
        text = intl.t("minutes-postponed", {
          mededelingOrNota: capitalizeFirstLetter(mededelingOrNota)
        })
        break;
      default:
        break;
    }
  }
  let pieces = await store.queryAll('piece', {
    'filter[agendaitems][:id:]': agendaitem.id,
    'filter[:has-no:next-piece]': true,
  });
  pieces = pieces.slice();
  let sortedPieces;
  if (agendaitem.isApproval) {
    sortedPieces = sortPieces(pieces, VrNotulenName, compareNotulen);
  } else {
    sortedPieces = sortPieces(pieces);
  }
  const agendaActivity = await agendaitem.agendaActivity;
  const subcase = await agendaActivity?.subcase;
  const pagebreak = agendaitem.number === 1 ? 'class="page-break"' : '';
  return `
  <h4 ${pagebreak}><u>${
    agendaitem.number
  }. ${generateBetreft(
    agendaitem.shortTitle,
    agendaitem.title,
    agendaitem.isApproval,
    sortedPieces,
    subcase?.subcaseName).toUpperCase()}</u></h4>
  <p>${text}</p>`
}
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderAbsentees() {
  return `
    <p><u>AFWEZIG MET KENNISGEVING</u></p>
    <table id="absentees">
      <tbody>
        <tr>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  `;
}

function renderNextMeeting(meeting, intl) {
  const currentPlannedStart = meeting.plannedStart;
  const nextPlannedStart = addWeeks(currentPlannedStart, 1);
  const date = dateFormat(nextPlannedStart, 'EEEE d MMMM yyyy');
  const time = dateFormat(nextPlannedStart, 'HH:mm');
  return `<p><span id="next-meeting">${intl.t("minutes-next-meeting", { date, time })}</span><p/>`;
}

async function updateMinutesNotas(data, intl, store) {
  const { meeting, notas, editorContent } = data;
  let newNotas = await renderNotas(meeting, notas, intl, store);

  const contentElement = document.createElement('template');
  contentElement.innerHTML = editorContent;

  const notasText = contentElement.content.querySelector('[data-section="agendaitems"]')?.outerHTML;
  if (notasText) {
    contentElement.content.querySelector('[data-section="agendaitems"]').outerHTML = newNotas;
  }
  // error? block should be found or button should not have been shown
  
  return contentElement.innerHTML;
}

async function updateMinutesAnnouncements(data, intl, store) {
  const { meeting, announcements, editorContent } = data;
  let newAnnouncements = await renderAnnouncements(meeting, announcements, intl, store);

  const contentElement = document.createElement('template');
  contentElement.innerHTML = editorContent;

  const announcementsText = contentElement.content.querySelector('[data-section="announcements"]')?.outerHTML;
  if (announcementsText) {
    contentElement.content.querySelector('[data-section="announcements"]').outerHTML = newAnnouncements;
  }
  // else error? block should be found or button should not have been shown (manually deleted maybe (PVV / EP / BM))

  return contentElement.innerHTML;
}

async function renderMinutes(data, intl, store) {
  const { meeting, attendees, notas, announcements, editorContent } = data;

  let newMinutesContent = `${renderAttendees(attendees)}
${renderAbsentees()}
${notas.length ? await renderNotas(meeting, notas, intl, store) : ''}
${announcements.length ? await renderAnnouncements(meeting, announcements, intl, store) : ''}
${renderNextMeeting(meeting, intl)}`;

  if (editorContent) {
    const contentElement = document.createElement('template');
    contentElement.innerHTML = editorContent;

    const newContentElement = document.createElement('template');
    newContentElement.innerHTML = newMinutesContent;

    const attendeesText = contentElement.content.querySelector('#attendees')?.innerHTML;
    if (attendeesText) {
      newContentElement.content.querySelector('#attendees').innerHTML = attendeesText;
    }

    const absenteesText = contentElement.content.querySelector('#absentees')?.innerHTML;
    if (absenteesText) {
      newContentElement.content.querySelector('#absentees').innerHTML = absenteesText;
    }

    const nextMeetingText = contentElement.content.querySelector('#next-meeting')?.innerHTML;
    if (nextMeetingText) {
      newContentElement.content.querySelector('#next-meeting').innerHTML = nextMeetingText;
    }

    newMinutesContent = newContentElement.innerHTML;
  }
  return newMinutesContent;
}

function mandateeName(mandatee) {
  return mandatee ? mandatee.person.get('fullName') : '';
}

export default class AgendaMinutesController extends Controller {
  @service store;
  @service router;
  @service intl;
  @service pieceAccessLevelService;
  @service decisionReportGeneration;
  @service currentSession;
  @service signatureService;

  meeting;
  @tracked isLoading = false;
  @tracked isEditing = false;
  @tracked isFullscreen = false;
  @tracked isUpdatingMinutesContent = false;
  @tracked hasSignFlow = false;
  @tracked hasMarkedSignFlow = false;
  @tracked editor = null;

  loadCurrentPiecePart = task(async () => {
    if (!this.model.minutes) return null;

    return await this.store.queryOne('piece-part', {
      filter: {
        minutes: { ':id:': this.model.minutes.id },
        ':has-no:next-piece-part': true,
      },
    });
  });

  currentPiecePartTask = trackedTask(this, this.loadCurrentPiecePart);

  saveMinutes = task(async () => {
    let minutes = null;
    if (!this.model.minutes) {
      const minutesType = await this.store.findRecordByUri(
        'concept',
        constants.DOCUMENT_TYPES.NOTULEN
      );

      const documentContainer = this.store.createRecord('document-container', {
        created: new Date(),
        type: minutesType,
      });
      await documentContainer.save();

      const defaultAccessLevel = await this.store.findRecordByUri(
        'concept',
        constants.ACCESS_LEVELS.INTERN_SECRETARIE
      );

      minutes = this.store.createRecord('minutes', {
        name: this.meeting.numberRepresentation,
        created: new Date(),
        minutesForMeeting: this.meeting,
        accessLevel: defaultAccessLevel,
        documentContainer,
      });
      await minutes.save();
    } else {
      minutes = this.model.minutes;
    }
    await minutes.save();

    const piecePart = this.store.createRecord('piece-part', {
      htmlContent: this.editor.htmlContent,
      created: new Date(),
      previousPiecePart: this.currentPiecePartTask?.value,
      minutes,
    });

    await piecePart.save();

    await this.decisionReportGeneration.generateReplacementMinutes.perform(
      minutes,
    );

    await this.meeting.belongsTo('minutes').reload();

    this.isEditing = false;
    this.refresh();
  });

  onCreateNewVersion = task(async () => {
    const minutes = this.model.minutes;
    let newName;
    try {
      newName = new VRDocumentName(minutes.name).withOtherVersionSuffix(
        (await (await minutes.documentContainer).pieces).length + 1
      );
    } catch (e) {
      newName = minutes.name;
    }

    const newVersion = this.store.createRecord('minutes', {
      name: newName,
      created: new Date(),
      minutesForMeeting: this.meeting,
      previousPiece: minutes,
      documentContainer: minutes.documentContainer,
      accessLevel: minutes.accessLevel,
    });

    await newVersion.save();

    const newPiecePart = this.store.createRecord('piece-part', {
      htmlContent: this.currentPiecePartTask.value.htmlContent,
      created: new Date(),
      previousPiecePart: this.currentPiecePartTask.value,
      minutes: newVersion,
    });

    await newPiecePart.save();

    await this.decisionReportGeneration.generateReplacementMinutes.perform(
      newVersion,
    );
    await this.signatureService.markNewPieceForSignature(minutes, newVersion, null, this.meeting);
    await this.pieceAccessLevelService.updatePreviousAccessLevels(newVersion);
    await this.meeting.save();

    this.refresh();
  });

  @action
  async updateEditorContent() {
    if (!this.editor) {
      return;
    }
    this.isUpdatingMinutesContent = true;
    this.editor.setHtmlContent(
      await renderMinutes(await this.reshapeModelForRender(), this.intl, this.store)
    );
    this.isUpdatingMinutesContent = false;
  }

  @action
  async updateEditorNotas() {
    if (!this.editor) {
      return;
    }
    this.isUpdatingMinutesContent = true;
    this.editor.setHtmlContent(
      await updateMinutesNotas(await this.reshapeModelForRender(), this.intl, this.store)
    );
    this.isUpdatingMinutesContent = false;
  }

  @action
  async updateEditorAnnouncements() {
    if (!this.editor) {
      return;
    }
    this.isUpdatingMinutesContent = true;
    this.editor.setHtmlContent(
      await updateMinutesAnnouncements(await this.reshapeModelForRender(), this.intl, this.store)
    );
    this.isUpdatingMinutesContent = false;
  }

  @action
  handleRdfaEditorInit(editor) {
    this.editor = editor;
    if (this.currentPiecePartTask?.value) {
      this.editor.setHtmlContent(this.currentPiecePartTask.value.htmlContent);
    }
  }

  @action
  revertToVersion(record) {
    this.editor.setHtmlContent(record.htmlContent);
  }

  @action
  async didDeleteMinutes() {
    this.refresh();
  }

  get saveDisabled() {
    if (this.currentPiecePartTask?.value?.htmlContent === this.editor?.htmlContent) {
      return true;
    }

    return this.editor?.mainEditorState.doc.textContent.length === 0;
  }

  get agendaContext() {
    return {
      agenda: this.agenda,
      meeting: this.meeting,
    };
  }

  get editorShowContentNotasButton() {
    if (this.currentPiecePartTask?.value) {
      return this.editor?.htmlContent.toString().includes("data-section=\"agendaitems\"");
    }
    return false;
  }

  get editorShowContentAnnouncementsButton() {
    if (this.currentPiecePartTask?.value) {
      return this.editor?.htmlContent.toString().includes("data-section=\"announcements\"");
    }
    return false;
  }

  get editorShowContentUpdateButton() {
    return !(this.editorShowContentNotasButton && this.editorShowContentAnnouncementsButton);
  }

  @action
  refresh() {
    this.router.refresh('agenda.minutes');
  }

  async getAttendees() {
    const attending = new Set();
    const primeMinister = mandateeName(
      this.model.mandatees.find(
        (mandatee) =>
          mandatee.mandate.get('role').get('uri') ===
          constants.MANDATE_ROLES.MINISTER_PRESIDENT
      )
    );
    attending.add(primeMinister);
    const viceMinisters = this.model.mandatees
      .filter(
        (mandatee) =>
          mandatee.mandate.get('role').get('uri') ===
          constants.MANDATE_ROLES.VICEMINISTER_PRESIDENT
      )
      .map(mandateeName)
      .filter((x) => !attending.has(x));
    viceMinisters.forEach((x) => attending.add(x));

    const ministers = this.model.mandatees
      .filter(
        (mandatee) =>
          mandatee.mandate.get('role').get('uri') ===
          constants.MANDATE_ROLES.MINISTER
      )
      .map(mandateeName)
      .filter((x) => !attending.has(x));

    const secretary = await this.meeting.secretary;
    await secretary?.person;

    return {
      primeMinister,
      viceMinisters,
      ministers,
      secretary,
    };
  }

  get mayEditMinutes() {
    return !this.isLoading &&
      this.currentSession.may('manage-minutes') &&
      (!this.hasSignFlow || this.hasMarkedSignFlow);
  }

  async reshapeModelForRender() {
    return {
      meeting: this.model.meeting,
      attendees: await this.getAttendees(),
      notas: this.model.notas,
      announcements: this.model.announcements,
      editorContent: this.editor.htmlContent,
    };
  }
}
