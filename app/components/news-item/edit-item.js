import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action,  } from '@ember/object';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';

export default class NewsItemEditItemComponent extends Component {
  @service intl;

  @tracked editorInstance;

  @tracked initValue;
  @tracked _isFullscreen;
  @tracked isTryingToSave = false;
  @tracked isExpanded = false;
  @tracked isLoading = false;

  set isFullscreen(isFullscreen) {
    this._isFullscreen = isFullscreen;
  }

  get isFullscreen() {
    return this._isFullscreen ?? this.args.isFullscreen;
  }

  get editorInstanceAvailable() {
    return this.editorInstance ? true : false;
  }

  get hasNota() {
    return this.args.agendaitem.nota;
  }

  get richtext() {
    if (!this.editorInstanceAvailable) {
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
    const themes = (await this.args.newsletterInfo.themes).toArray();
    if (themes.length > 0) {
      return this.saveChanges();
    }
    this.isTryingToSave = true;
  }

  @action
  async cancelEditing() {
    const newsletterInfo = await this.args.newsletterInfo;
    newsletterInfo.rollbackAttributes();
    if (!newsletterInfo.isDeleted) {
      newsletterInfo.hasMany('themes').reload();
    }
    if (this.args.onCancel) {
      this.args.onCancel();
    }
  }

  @action
  async saveChanges() {
    this.isLoading = true;
    const newsletterInfo = await this.args.newsletterInfo;
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
      newsletterInfo.richtext = cleanedHtml;
    } catch {
      // pass
    }
    await newsletterInfo.save();

    this.isLoading = false;
    if (this.args.onSave) {
      this.args.onSave();
    }
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
