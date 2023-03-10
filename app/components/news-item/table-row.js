import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import sanitizeHtml from 'sanitize-html';

export default class NewsItemTableRowComponent extends Component {
  @service currentSession;
  @service toaster;
  @service intl;
  @service agendaitemNota;

  @tracked isOpenEditView = false;
  @tracked notaOrVisieNota;

  constructor() {
    super(...arguments);
    this.loadNotaOrVisienota.perform();
  }

  @task
  *saveNewsItem(newsItem, wasNewsItemNew) {
    yield this.args.onSave(newsItem, wasNewsItemNew);
    this.closeEditView();
  }

  @task
  *loadNotaOrVisienota() {
    this.notaOrVisieNota = yield this.agendaitemNota.notaOrVisieNota(
      this.args.agendaitem
    );
  }

  @task
  *toggleInNewsletterFlag(checked) {
    this.args.newsItem.inNewsletter = checked;
    yield this.saveNewsItem.perform(this.args.newsItem);
  }

  @action
  async openNota() {
    if (this.notaOrVisieNota) {
      window.open(`/document/${this.notaOrVisieNota.id}`);
    }
  }

  @action
  async openEditView() {
    await this.args.newsItem?.preEditOrSaveCheck();
    this.isOpenEditView = true;
  }

  @action
  closeEditView(wasNewsItemNew) {
    this.args.onCancel(wasNewsItemNew);
    this.isOpenEditView = false;
  }

  @action
  copyText(newsItem) {
    let copyText = '';

    if (newsItem.title) {
      copyText += `${newsItem.title}\n\n`;
    }

    copyText +=
      sanitizeHtml(
        newsItem.htmlContent
          .replace(/<p>(.*?)<\/p>/gi, '$1\n\n') // Replace p-tags with \n line breaks
          .replace(/<br\s*[/]?>/gi, '\n') // Replace br-tags with \n line break
          .trim() // Trim whitespaces at start & end of the string
        , {allowedTags: [], allowedAttributes: {}} // Remove all remaining tags from the string
      );

    if (newsItem.remark) {
      copyText += `\n\n${newsItem.remark}`;
    }

    navigator.clipboard.writeText(copyText);
    this.toaster.success(this.intl.t('text-copied'));
  }
}
