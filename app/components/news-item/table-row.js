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
  @service currentSession;

  @tracked isOpenEditView = false;
  @tracked notaOrVisieNota;
  @tracked decisionActivity;
  @tracked subcase;

  constructor() {
    super(...arguments);
    this.loadNotaOrVisienota.perform();
    this.loadDecisionActivity.perform();
    this.loadSubcase.perform();
  }

  get class() {
    const classes = ['lt-row'];
    if (this.decisionActivity?.get('isPostponed') || this.decisionActivity?.get('isRetracted')) {
      classes.push('auk-u-opacity--1/3');
    }
    return classes.join(' ');
  }

  loadDecisionActivity = task(async () => {
    const treatment = await this.args.agendaitem.treatment;
    this.decisionActivity = await treatment?.decisionActivity;
    await this.decisionActivity?.belongsTo('decisionResultCode').reload();
  });

  loadSubcase = task(async () => {
    const agendaActivity = await this.args.agendaitem.agendaActivity;
    this.subcase = await agendaActivity?.subcase;
  })

  saveNewsItem = task(async (newsItem, wasNewsItemNew) => {
    await newsItem.stopEditingOnSave();
    await this.args.onSave(wasNewsItemNew);
    this.isOpenEditView = false;
  });

  loadNotaOrVisienota = task(async () => {
    this.notaOrVisieNota = await this.agendaitemNota.notaOrVisieNota(
      this.args.agendaitem
    );
  });

  toggleInNewsletterFlag = task(async (checked) => {
    this.args.newsItem.inNewsletter = checked;
    await this.args.newsItem.save(); // not setting/unsetting isbeingEditedBy
    await this.args.onSave();
  });

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
  async closeEditView(newsItem, wasNewsItemNew) {
    await newsItem?.stopEditingOnCancel(this.currentSession.user);
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
