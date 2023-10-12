import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import constants from 'frontend-kaleidos/config/constants';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import { generateBetreft } from 'frontend-kaleidos/utils/decision-minutes-formatting';

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

async function renderNotas(notas, betreftPieceParts, intl) {
  const agendalist = await renderAgendaitemList(notas, betreftPieceParts, intl);
  return agendalist;
}

async function renderAnnouncements(announcements, betreftPieceParts, intl) {
  return `
    <h4><u>MEDEDELINGEN</u></h4>
    ${await renderAgendaitemList(announcements, betreftPieceParts, intl)}
  `;
}

async function renderAgendaitemList(agendaitems, betreftPieceParts, intl) {
  let agendaitemList = "";
  for (const agendaitem of agendaitems) {
    agendaitemList += await getMinutesListItem(betreftPieceParts, agendaitem, intl);
  }
  return agendaitemList;
}
async function getMinutesListItem(betreftPieceParts, agendaitem, intl) {
  const betreftPiecePart = betreftPieceParts.find(piecePart => piecePart.agendaitemID === agendaitem.id);
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
      if (betreftPiecePart) {
        text = intl.t("minutes-approval", {
          mededelingOrNota: capitalizeFirstLetter(mededelingOrNota),
          reportName: betreftPiecePart['reportName']
        })
      }
      break;
    case constants.DECISION_RESULT_CODE_URIS.INGETROKKEN:
      text = intl.t("minutes-retracted", {
        mededelingOrNota: capitalizeFirstLetter(mededelingOrNota)
      })
      break;
    case constants.DECISION_RESULT_CODE_URIS.KENNISNAME:
      text = intl.t("minutes-acknowledged", {
        mededelingOrNota: capitalizeFirstLetter(mededelingOrNota)
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
  if (betreftPiecePart) {
    return `<h4><u>${
      agendaitem.number
    }. ${betreftPiecePart['value'].replace( /(<([^>]+)>)/ig, '').toUpperCase()}</u></h4>
    <p>${text}</p>
    `
  }
  const documents = await agendaitem.pieces;
  return `
  <h4><u>${
    agendaitem.number
  }. ${generateBetreft(agendaitem.shortTitle, agendaitem.title, agendaitem.isApproval, documents).toUpperCase()}</u></h4>
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
  const { attendees, notas, announcements, betreftPieceParts } = data;
  return `
    ${renderAttendees(attendees)}
    ${renderAbsentees()}
    ${notas ? await renderNotas(notas, betreftPieceParts, intl) : ''}
    ${announcements ? await renderAnnouncements(announcements, betreftPieceParts, intl) : ''}
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

  currentPiecePart = trackedTask(this, this.loadCurrentPiecePart);

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
        name: `Notulen - P${dateFormat(
          this.meeting.plannedStart,
          'yyyy-MM-dd'
        )}`,
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
    const piecePart = this.store.createRecord('piece-part', {
      value: this.editor.htmlContent,
      created: new Date(),
      previousPiecePart: this.currentPiecePart.value,
      minutes,
    });

    await minutes.save();
    await piecePart.save();

    this.decisionReportGeneration.generateReplacementMinutes.perform(
      minutes,
    );

    await minutes.save();
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

    const newPiecePart = this.store.createRecord('piece-part', {
      value: this.currentPiecePart.value.value,
      created: new Date(),
      previousPiecePart: this.currentPiecePart.value,
      minutes: newVersion,
    });

    await newVersion.save();
    await newPiecePart.save();

    const fileMeta = await this.decisionReportGeneration.generateReplacementMinutes.perform(
      newVersion,
    );
    if (fileMeta) {
      await this.replaceMinutesFile(newVersion, fileMeta.id);
    }

    await newVersion.save();
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
    if (this.currentPiecePart.value) {
      this.editor.setHtmlContent(this.currentPiecePart.value.value);
    }
  }

  @action
  revertToVersion(record) {
    this.editor.setHtmlContent(record.value);
  }

  get saveDisabled() {
    if (this.currentPiecePart?.value?.value === this.editor?.htmlContent) {
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
      attendees: await this.getAttendees(),
      notas: this.model.notas,
      announcements: this.model.announcements,
      betreftPieceParts: this.model.betreftPieceParts
    };
  }
}
