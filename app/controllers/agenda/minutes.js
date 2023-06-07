import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import constants from 'frontend-kaleidos/config/constants';
import { SECRETARIS_NAME } from 'frontend-kaleidos/config/config';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';
import { deleteFile } from 'frontend-kaleidos/utils/document-delete-helpers';

function renderAttendees(attendees) {
  const { primeMinister, viceMinisters, ministers, secretaris } = attendees;
  return `
    <h4>Aanwezig</h4>
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
          <td>${secretaris}</td>
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
    <h4>Mededelingen</h4>
    ${renderAgendaitemList(announcements)}
  `;
}

function renderAgendaitemList(agendaitems) {
  return agendaitems
    .map(
      (agendaitem) => `
        <h4>${agendaitem.number}. ${agendaitem.shortTitle}</h4>
        ${agendaitem.title ? `<p>${agendaitem.title}</p>` : ''}
      `
    )
    .join('');
}

function renderAbsentees() {
  return `
    <h4>Afwezig met kennisgeving</h4>
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

function getAttendees(model) {
  const seen = new Set();
  const primeMinister = mandateeName(
    model.mandatees.find(
      (mandatee) =>
        mandatee.mandate.get('role').get('uri') ===
        constants.MANDATE_ROLES.MINISTER_PRESIDENT
    )
  );
  seen.add(primeMinister);
  const viceMinisters = model.mandatees
    .filter(
      (mandatee) =>
        mandatee.mandate.get('role').get('uri') ===
        constants.MANDATE_ROLES.VICEMINISTER_PRESIDENT
    )
    .map(mandateeName)
    .filter((x) => !seen.has(x));
  viceMinisters.forEach((x) => seen.add(x));

  const ministers = model.mandatees
    .filter(
      (mandatee) =>
        mandatee.mandate.get('role').get('uri') ===
        constants.MANDATE_ROLES.MINISTER
    )
    .map(mandateeName)
    .filter((x) => !seen.has(x));

  return {
    primeMinister,
    viceMinisters,
    ministers,
    secretaris: SECRETARIS_NAME,
  };
}

function reshapeModelForRender(model) {
  return {
    attendees: getAttendees(model),
    notas: model.notas,
    announcements: model.announcements,
  };
}

function mandateeName(mandatee) {
  return `${mandatee.person.get('firstName')} ${mandatee.person.get(
    'lastName'
  )}`;
}

export default class AgendaMinutesController extends Controller {
  @service store;
  @service toaster;
  @service router;
  @service intl;

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

  exportPdf = task(async (minutes) => {
    const resp = await fetch(`/generate-minutes-report/${minutes.id}`);
    if (!resp.ok) {
      this.toaster.error(this.intl.t('error-while-exporting-pdf'));
      return;
    }
    return await resp.json();
  });

  saveMinutes = task(async () => {
    let minutes = null;
    if (!this.model.minutes) {
      minutes = this.store.createRecord('minutes', {
        name: `Notulen - P${dateFormat(
          this.meeting.plannedStart,
          'yyyy-MM-dd'
        )}`,
        created: new Date(),
        minutesForMeeting: this.meeting,
      });
      minutes.save();
    } else {
      minutes = this.model.minutes;
    }
    const piecePart = this.store.createRecord('piece-part', {
      value: this.editor.htmlContent,
      created: new Date(),
      previousPiecePart: this.currentPiecePart.value,
      minutes,
    });

    const fileMeta = await this.exportPdf.perform(minutes);
    if (fileMeta) {
      await this.replaceMinutesFile(minutes, fileMeta.id);
    }

    await minutes.save();
    await piecePart.save();
    await this.meeting.save();

    this.isEditing = false;
    this.refresh();
  });

  async replaceMinutesFile(minutes, fileId) {
    await deleteFile(minutes.file);
    const file = await this.store.findRecord('file', fileId);
    minutes.file = file;
    minutes.modified = new Date();
    minutes.save();
  }

  @action
  updateEditorContent() {
    if (!this.editor) {
      return;
    }

    this.editor.setHtmlContent(
      renderMinutes(reshapeModelForRender(this.model))
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

  @action
  refresh() {
    this.router.refresh('agenda.minutes');
  }
}
