import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaNotesController extends Controller {
  editorInstance;

  @tracked isFullscreen = false;
  @tracked isEditing = false;

  @action
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  @action
  toggleAll() {
    this.isFullscreen = false;
    this.isEditing = false;
  }

  @action
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  @action
  handleRdfaEditorInit(editorInterface) {
    this.editorInstance = editorInterface;
  }
}
