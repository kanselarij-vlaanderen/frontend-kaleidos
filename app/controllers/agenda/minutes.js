import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

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

  exportPdf = task(async () => {
    console.log('not implemented');
    return;
  });

  saveMinutes = task(async () => {
    const now = new Date();
    console.log('test');
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
  handleRdfaEditorInit(editor) {}

  @action
  refresh() {
    this.router.refresh('agenda.documents');
  }
}
