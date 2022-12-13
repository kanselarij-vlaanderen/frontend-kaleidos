import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import sanitizeHtml from 'ember-cli-sanitize-html';

export default class NewsletterItemTableRowComponent extends Component {
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
  *saveNewsletterItem(newsletterItem) {
    yield this.args.onSave(newsletterItem);
    this.closeEditView();
  }

  @task
  *loadNotaOrVisienota() {
    this.notaOrVisieNota = yield this.agendaitemNota.notaOrVisieNota(
      this.args.agendaitem
    );
  }

  @action
  async toggleInNewsletterFlag(event) {
    this.args.newsletterItem.inNewsletter = event.target.checked;
    await this.saveNewsletterItem.perform(this.args.newsletterItem);
  }

  @action
  async openNota() {
    if (this.notaOrVisieNota) {
      window.open(`/document/${this.notaOrVisieNota.id}`);
    }
  }

  @action
  openEditView() {
    this.isOpenEditView = true;
  }

  @action
  closeEditView() {
    this.isOpenEditView = false;
  }

  @action
  copyText(newsletterItem) {
    let copyText = '';

    if (newsletterItem.title) {
      copyText += `${newsletterItem.title}\n\n`;
    }

    copyText +=
      sanitizeHtml(
        newsletterItem.htmlContent
          .replace(/<p>(.*?)<\/p>/g, '$1\n\n') // Replace p-tags with \n line breaks
          .trim() // Trim whitespaces at start & end of the string
        , {allowedTags: [], allowedAttributes: {}} // Remove all remaining tags from the string
      );

    if (newsletterItem.remark) {
      copyText += `\n\n${newsletterItem.remark}`;
    }

    navigator.clipboard.writeText(copyText);
    this.toaster.success(this.intl.t('text-copied'));
  }
}
