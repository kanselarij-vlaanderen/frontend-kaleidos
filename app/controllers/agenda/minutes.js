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
import { generateBetreft } from 'frontend-kaleidos/utils/decision-minutes-formatting';
import generateReportName from 'frontend-kaleidos/utils/generate-report-name';

function renderAttendees(attendees) {
  const { primeMinister, viceMinisters, ministers, secretary } = attendees;
  let secretaryTitle = secretary?.title.toLowerCase() || 'secretaris';
  return `
    <p><u>AANWEZIG</u></p>
    <table>
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
          <td id="secretary">${mandateeName(secretary)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

async function renderNotas(meeting, notas, intl) {
  return await renderAgendaitemList(meeting, notas, intl);
}

async function renderAnnouncements(meeting, announcements, intl) {
  return `
    <h4><u>MEDEDELINGEN</u></h4>
    ${await renderAgendaitemList(meeting, announcements, intl)}
  `;
}

async function renderAgendaitemList(meeting, agendaitems, intl) {
  let agendaitemList = "";
  for (const agendaitem of agendaitems) {
    agendaitemList += await getMinutesListItem(meeting, agendaitem, intl);
  }
  return agendaitemList;
}
async function getMinutesListItem(meeting, agendaitem, intl) {
  const treatment = await agendaitem.treatment;
  const decisionActivity = await treatment?.decisionActivity;
  const decisionResultCode = await decisionActivity?.decisionResultCode;
  let mededelingOrNota = "";
  if (agendaitem.type?.get('uri') === constants.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
    mededelingOrNota = "deze mededeling";
  } else {
    mededelingOrNota = "dit punt";
  }
  let text = "";
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
  const documents = await agendaitem.pieces;
  let sortedPieces;
  if (agendaitem.isApproval) {
    sortedPieces = sortPieces(documents, VrNotulenName, compareNotulen);
  } else {
    sortedPieces = sortPieces(documents);
  }
  const agendaActivity = await agendaitem.agendaActivity;
  const subcase = await agendaActivity?.subcase;
  return `
  <h4><u>${
    agendaitem.number
  }. ${generateBetreft(agendaitem.shortTitle, agendaitem.title, agendaitem.isApproval, sortedPieces, subcase?.subcaseName).toUpperCase()}</u></h4>
  <p>${text}</p>`
}
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderAbsentees() {
  return `
    <p><u>AFWEZIG MET KENNISGEVING</u></p>
    <table>
      <tbody>
        <tr>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  `;
}

async function renderMinutes(data, intl) {
  const { meeting, attendees, notas, announcements } = data;
  return `
    ${renderAttendees(attendees)}
    ${renderAbsentees()}
    ${notas ? await renderNotas(meeting, notas, intl) : ''}
    ${announcements ? await renderAnnouncements(meeting, announcements, intl) : ''}
  `;
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

  // agenda;
  meeting;
  // defaultAccessLevel;
  @tracked isEditing = false;
  @tracked isFullscreen = false;

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

      // *note: any changes made here should also be made in the minutes-report-generation service
      const name = `Notulen - P${dateFormat(
        this.meeting.plannedStart,
        'yyyy-MM-dd'
      )}`;

      minutes = this.store.createRecord('minutes', {
        name,
        created: new Date(),
        minutesForMeeting: this.meeting,
        accessLevel: defaultAccessLevel,
        documentContainer,
        isReportOrMinutes: true,
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

    this.decisionReportGeneration.generateReplacementMinutes.perform(
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
      isReportOrMinutes: true,
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

    await this.pieceAccessLevelService.updatePreviousAccessLevels(newVersion);
    await this.meeting.save();

    this.refresh();
  });

  @action
  async updateEditorContent() {
    if (!this.editor) {
      return;
    }

    this.editor.setHtmlContent(
      await renderMinutes(await this.reshapeModelForRender(), this.intl)
    );
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

  async reshapeModelForRender() {
    return {
      meeting: this.model.meeting,
      attendees: await this.getAttendees(),
      notas: this.model.notas,
      announcements: this.model.announcements,
    };
  }
}
