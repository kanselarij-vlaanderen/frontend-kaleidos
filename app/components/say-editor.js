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

  @action
  revertToVersion(record) {
    if (!this.args.versioningValueKey) {
      console.warn(
        'You are trying to revert to a version without supplying a value key. Supply a @versioningValueKey argument'
      );
      return;
    }

    this.editorInstance.setHtmlContent(record[this.args.versioningValueKey]);
  }
}
