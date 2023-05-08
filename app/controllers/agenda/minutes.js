import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { task } from 'ember-concurrency';
import { all } from 'ember-concurrency';

export default class AgendaMinutesController extends Controller {
  @service store;
  @service toaster;
  @service fileConversionService;
  @service router;
  @service intl;

  agenda;
  meeting;
  defaultAccessLevel;
  @tracked isFullscreen = false;

  @action
  handleRdfaEditorInit(editor) {}

  @action
  refresh() {
    this.router.refresh('agenda.documents');
  }
}
