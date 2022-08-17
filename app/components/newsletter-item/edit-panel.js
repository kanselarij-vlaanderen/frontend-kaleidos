import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class NewsletterItemEditPanelComponent extends Component {
  @service newsletterService;

  editorInstance;
  @tracked newsletterItem;
  @tracked isFullscreen = false;
  @tracked proposalText;
  @tracked isOpenMissingThemesModal = false;

  // Local copy of newsletterItem attributes/relations to facilitate rollback
  @tracked title;
  @tracked remark;
  @tracked richText;
  @tracked isFinished;
  @tracked selectedThemes = [];

  constructor() {
    super(...arguments);
    this.isFullscreen = this.args.isFullscreen;
    this.ensureNewsletterItem.perform();
  }

  @task
  *ensureNewsletterItem() {
    this.newsletterItem = this.args.newsletterItem;
    if (!this.newsletterItem) {
      this.newsletterItem = yield this.newsletterService.createNewsItemForAgendaitem(this.args.agendaitem);
    }

    this.title = this.newsletterItem.title;
    this.remark = this.newsletterItem.remark;
    // rdfa-editor doesn't correctly handle 'undefined' as initial value.
    // Therefore we pass an empty string instead.
    this.richtext = this.newsletterItem.richtext || '';
    this.isFinished = this.newsletterItem.finished;
    this.selectedThemes = (yield this.newsletterItem.themes).toArray();

    this.proposalText = yield this.newsletterService.generateNewsItemMandateeProposalText(this.newsletterItem);
  }

  @action
  save() {
    if (this.selectedThemes.length == 0) {
      this.isOpenMissingThemesModal = true;
    } else {
      this.confirmSave.perform();
    }
  }

  @task
  *confirmSave() {
    if (!this.editorInstance) {
      throw new Error("Can't get rich text since editor-instance isn't available!");
    }

    this.newsletterItem.title = this.title;
    this.newsletterItem.remark = this.remark;
    this.newsletterItem.finished = this.isFinished;
    this.newsletterItem.themes = this.selectedThemes;
    this.newsletterItem.richtext = this.editorInstance.htmlContent;
    yield this.args.onSave(this.newsletterItem);
    this.isOpenMissingThemesModal = false;
  }

  @action
  cancelSave() {
    this.isOpenMissingThemesModal = false;
  }

  @action
  async openNota() {
    const nota = await this.args.agendaitem.notaOrVisienota;
    if (nota) {
      const piece = await nota.get('lastPiece');
      window.open(`/document/${piece.get('id')}`);
    }
  }

  @action
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  @action
  handleRdfaEditorInit(editorInterface) {
    this.editorInstance = editorInterface;
    editorInterface.setHtmlContent(this.richtext);
  }
}
