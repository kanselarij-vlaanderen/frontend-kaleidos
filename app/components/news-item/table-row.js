import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { copyText } from 'frontend-kaleidos/utils/copy-text-to-clipboard';

export default class NewsItemTableRowComponent extends Component {
  @service toaster;
  @service intl;
  @service agendaitemNota;

  @tracked isOpenEditView = false;
  @tracked notaOrVisieNota;
  @tracked decisionActivity;

  constructor() {
    super(...arguments);
    this.loadNotaOrVisienota.perform();
    this.loadDecisionActivity.perform();
  }

  @task
  *loadDecisionActivity() {
    const treatment = yield this.args.agendaitem.treatment;
    this.decisionActivity = yield treatment?.decisionActivity;
    yield this.decisionActivity?.decisionResultCode;
  }

  get class() {
    const classes = ['lt-row'];
    if (this.decisionActivity?.get('isPostponed') || this.decisionActivity?.get('isRetracted')) {
      classes.push('auk-u-opacity--1/3');
    }
    return classes.join(' ');
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
  copyItemText(newsItem) {
    copyText([newsItem.title, newsItem.htmlContent, newsItem.remark]).then(() => {
      this.toaster.success(this.intl.t('text-copied'));
    });
  }
}
