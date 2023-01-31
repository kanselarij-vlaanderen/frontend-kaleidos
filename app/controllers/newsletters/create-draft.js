import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class NewslettersCreateDraftController extends Controller {
  editorInstance;

  @tracked isFullscreen = false;
  @tracked isEditing = true;
  @tracked isSigned = true;
  @tracked document = false;
  @tracked signatureRequested = false;

  @action
  showDocument() {
    this.document = true;
  }

  @action
  requestSignature() {
    this.signatureRequested = true;
  }

  @action
  toggleSigned() {
    this.isSigned = !this.isSigned;
  }

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
    editorInterface.setHtmlContent(
      '<p>Draft tekst</p>'
    );
  }
}
