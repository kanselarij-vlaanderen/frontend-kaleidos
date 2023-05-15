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
    <h1>Aanwezig</h1>
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
  return renderAnnouncements(notas);
}

function renderAnnouncements(announcements) {
  return `
    <h1>Mededelingen</h1>
    <ul>
      ${announcements
        .map((announcement) => `<li>${announcement.shortTitle}</li>`)
        .join('')}
    </ul>
  `;
}

function renderAbsentees() {
  return `
    <h1>Afwezig met kennisgeving</h1>
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
    ${renderAttendees(attendees)}<br />
    ${renderAbsentees()}
    ${notas ? `<br/>${renderNotas(notas)}` : ''}
    ${announcements ? `<br /> ${renderAnnouncements(announcements)}` : ''}
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
    // TODO: add value here
    await this.store
      .createRecord('piece', {
        name: 'TODO not sure what to put here',
        created: now,
        modified: now,
        isMinutesForMeeting: this.meeting,
        ...(this.model ? { previousPiece: this.model } : {}),
      })
      .save();
    this.isEditing = false;
    return;
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
