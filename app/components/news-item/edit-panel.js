import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class NewsItemEditPanelComponent extends Component {
  @service newsletterService;
  @service agendaitemNota;

  editorInstance;
  @tracked newsItem;
  @tracked isFullscreen = false;
  @tracked proposalText;
  @tracked isOpenMissingThemesModal = false;
  @tracked newsItemIsNew = false;

  // Local copy of newsItem attributes/relations to facilitate rollback
  @tracked title;
  @tracked remark;
  @tracked htmlContent;
  @tracked isFinished;
  @tracked selectedThemes = [];
  @tracked notaOrVisieNota;

  constructor() {
    super(...arguments);
    this.isFullscreen = this.args.isFullscreen;
    this.ensureNewsItem.perform();
    this.loadNotaOrVisienota.perform();
  }

  @task
  *ensureNewsItem() {
    this.newsItem = this.args.newsItem;
    if (!this.newsItem) {
      this.newsItemIsNew = true;
      this.newsItem = yield this.newsletterService.createNewsItemForAgendaitem(this.args.agendaitem);
      if (this.newsItem) {
        // If the service call returned a newsItem, it is new and we save immediately to avoid concurrency issues
        yield this.newsItem.save();
      } else {
        // If the service call returned nothing, it means someone else created a newsitem and we have to refresh
        return this.args.onCancel(this.newsItemIsNew);
      }
    }

    this.title = this.newsItem.title;
    this.remark = this.newsItem.remark;
    // rdfa-editor doesn't correctly handle 'undefined' as initial value.
    // Therefore we pass an empty string instead.
    this.htmlContent = this.newsItem.htmlContent || '';
    this.isFinished = this.newsItem.finished;
    yield this.newsItem.hasMany('themes').reload(); // concurrency in some cases
    this.selectedThemes = (yield this.newsItem.themes).toArray();

    this.proposalText = yield this.newsletterService.generateNewsItemMandateeProposalText(this.newsItem);
  }

  @task
  *loadNotaOrVisienota() {
    this.notaOrVisieNota = yield this.agendaitemNota.notaOrVisieNota(this.args.agendaitem);
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

    this.newsItem.title = this.title;
    this.newsItem.remark = this.remark;
    this.newsItem.finished = this.isFinished;
    this.newsItem.themes = this.selectedThemes;
    try {
      // As of v0.59.1, the editor inserts &nbsp; whenever a user selects text
      // and makes it bold. It also inserts &nbsp; when a user starts typing
      // in the middle of already existing text. Additionally, it should insert
      // &nbsp; whenever a user types multiple spaces after each other, otherwise
      // they get collapsed.
      //
      // The last case is not really important to us, if a user complains about
      // it we will deal with it later. But we do care about the first two cases,
      // because users complain about the flow of text breaking up outside of the
      // editor (e.g. when viewing the Kort Bestek text). It's also important when
      // we send it off via Mailchimp, because it also has impact on the layout
      // in mail readers. For that reason, we now strip ALL &nbsp; regardless of
      // whether they hug html tags or not.
      const htmlContent = this.editorInstance.htmlContent;
      const cleanedHtml = htmlContent.replaceAll(/&nbsp;/gm, ' ');
      this.newsItem.htmlContent = cleanedHtml;
    } catch {
      // pass
    }
    yield this.args.onSave(this.newsItem, this.newsItemIsNew);
    this.isOpenMissingThemesModal = false;
  }

  @action
  cancelSave() {
    this.isOpenMissingThemesModal = false;
  }

  @action
  async openNota() {
    if (this.notaOrVisieNota) {
      window.open(`/document/${this.notaOrVisieNota.id}`);
    }
  }

  @action
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  @action
  handleRdfaEditorInit(editorInterface) {
    this.editorInstance = editorInterface;
    editorInterface.setHtmlContent(this.htmlContent);
  }
}
