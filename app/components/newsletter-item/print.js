import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class NewsletterItemPrintComponent extends Component {
  @service currentSession;
  @service newsletterService;

  @tracked agendaItemType;
  @tracked proposalText;
  @tracked isEditing = false;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get isRemark() {
    return this.agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.REMARK;
  }

  get canEditNewsletter(){
    return this.currentSession.may('manage-newsletter-infos');
  }

  @task
  *loadData() {
    if (this.args.newsletterItem) {
      this.proposalText = yield this.newsletterService.generateNewsItemMandateeProposalText(this.args.newsletterItem);
    }
    if (this.args.agendaitem) {
      this.agendaItemType = yield this.args.agendaitem.type;
    }
  }

  @action
  openEdit() {
    this.isEditing = true;
  }

  @action
  closeEdit() {
    this.isEditing = false;
  }

  @action
  async save() {
    await this.args.onSave();
    this.closeEdit();
  }
}
