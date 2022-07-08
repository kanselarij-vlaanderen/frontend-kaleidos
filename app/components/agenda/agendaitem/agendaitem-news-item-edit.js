import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action,  } from '@ember/object';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';
import { task } from 'ember-concurrency';

export default class AgendaAgendaitemAgendaitemNewsItemEditComponent extends Component {
  @service intl;

  @tracked editorInstance;

  @tracked initValue;
  @tracked isFullscreen;
  @tracked isTryingToSave = false;
  @tracked isExpanded = false;

  @tracked title;
  @tracked remark;
  @tracked isFinished;
  @tracked themes;

  constructor() {
    super(...arguments);

    this.isFullscreen = this.args.isFullscreen;
    this.title = this.args.newsletterInfo.title;
    this.remark = this.args.newsletterInfo.remark;
    this.isFinished = this.args.newsletterInfo.finished;
    this.loadThemes.perform();
  }

  @task
  *loadThemes() {
    this.themes = (yield this.args.newsletterInfo.themes).toArray();
  }

  get richtext() {
    if (!this.editorInstance) {
      throw new Error("Can't get rich text since editor-instance isn't available!");
    }
    return this.editorInstance.htmlContent;
  }

  @action
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  @action
  async trySaveChanges() {
    if (this.themes.length > 0) {
      return this.saveChanges.perform();
    }
    this.isTryingToSave = true;
  }

  @action
  async cancelEditing() {
    if (this.args.onCancel) {
      this.args.onCancel();
    }
  }

  @task
  *saveChanges() {
    if (this.args.onSave) {
      this.args.newsletterInfo.title = this.title;
      this.args.newsletterInfo.remark = this.remark;
      this.args.newsletterInfo.finished = this.isFinished;
      this.args.newsletterInfo.themes = this.themes;
      try {
        // The editor introduces &nbsp; instead of normal spaces to work around
        // certain browsers' behavior where normal spaces on outer ends of text nodes
        // aren't rendered in the content-editable. In recent versions of the editor however,
        // this &nbsp;-inserting seems to happen too often, which results in very long
        // lines that don't break, which is undesired.
        // Here we replace all &nbsp's that don't lean against html tags in an attempt
        // to keep the editor's workaround behavior, while replacing unnecessary &nbsp;'s
        //
        const cleanedHtml = this.richtext.replaceAll(/(?<!>)&nbsp;(?!<)/gm, ' ');
        this.args.newsletterInfo.richtext = cleanedHtml;
      } catch {
        // pass
      }
      yield this.args.onSave();
    }
    this.isTryingToSave = false;
  }

  @action
  async openDocument() {
    const nota = await this.args.agendaitem.notaOrVisienota;
    if (!nota) {
      return;
    }
    const piece = await nota.lastPiece;
    window.open(`/document/${piece.get('id')}`);
  }

  @action
  async handleRdfaEditorInit(editorInterface) {
    const newsletterInfo = await this.args.newsletterInfo;
    let newsLetterInfoText = newsletterInfo.richtext;
    if (isNone(newsLetterInfoText)) {
      // editor stringifies non-string values (to "undefined" for example)
      newsLetterInfoText = '';
    }
    editorInterface.setHtmlContent(newsLetterInfoText);
    this.editorInstance = editorInterface;
  }
}
