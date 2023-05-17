import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import constants from 'frontend-kaleidos/config/constants';
import { SECRETARIS_NAME } from 'frontend-kaleidos/config/config';

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

  exportPdf = task(async () => {
    console.log('not implemented');
    return;
  });

  saveMinutes = task(async () => {
    const now = new Date();
    await this.store
      .createRecord('minutes', {
        name: 'TODO not sure what to put here',
        created: now,
        modified: now,
        isMinutesForMeeting: this.meeting,
        value: this.editor.htmlContent,
        // ...(this.model.minutes ? { previousPiece: this.model.minutes } : {}),
      })
      .save();

    this.isEditing = false;
  });

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
  }

  @action
  refresh() {
    this.router.refresh('agenda.documents');
  }
}
