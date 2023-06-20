import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SayEditorComponent extends Component {
  @tracked isFullscreen = false;
  @tracked editorInstance = null;

  constructor() {
    super(...arguments);
  }

  @action
  handleRdfaEditorInit(editorInterface) {
    if (this.editorInstance) {
      editorInterface.setHtmlContent(this.editorInstance.htmlContent);
    }

    this.editorInstance = editorInterface;

    this.args.handleRdfaEditorInit?.(editorInterface);
  }
}
