import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import constants from 'frontend-kaleidos/config/constants';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';
import { deleteFile } from 'frontend-kaleidos/utils/document-delete-helpers';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';

function renderAttendees(attendees) {
  const { primeMinister, viceMinisters, ministers, secretary } = attendees;
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
          <td>De secretaris</td>
          <td id="secretary">${secretary}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function renderNotas(notas) {
  return renderAgendaitemList(notas);
}

function renderAnnouncements(announcements) {
  return `
    <h4><u>MEDEDELINGEN</u></h4>
    ${renderAgendaitemList(announcements)}
  `;
}

function renderAgendaitemList(agendaitems) {
  return agendaitems
    .map(
      (agendaitem) => `
        <h4><u>${
          agendaitem.number
        }. ${agendaitem.shortTitle.toUpperCase()}</u></h4>
        ${agendaitem.title ? `<p>${agendaitem.title}</p>` : ''}
      `
    )
    .join('');
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

function renderMinutes(data) {
  const { attendees, notas, announcements } = data;
  return `
    ${renderAttendees(attendees)}
    ${renderAbsentees()}
    ${notas ? renderNotas(notas) : ''}
    ${announcements ? renderAnnouncements(announcements) : ''}
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
        constants.ACCESS_LEVELS.INTERN_OVERHEID
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
    });

    const newPiecePart = this.store.createRecord('piece-part', {
      value: this.currentPiecePart.value.value,
      created: new Date(),
      previousPiecePart: this.currentPiecePart.value,
      minutes: newVersion,
    });

    await newVersion.save();
    await newPiecePart.save();

    const fileMeta = await this.exportPdf.perform(newVersion);
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
      renderMinutes(await this.reshapeModelForRender())
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

    const secretary =
      mandateeName(
        await this.store.queryOne('mandatee', {
          'filter[secretary-for-agendas][:id:]': this.meeting.id,
          include: 'person',
        })
      ) ?? '';

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
    };
  }
}
