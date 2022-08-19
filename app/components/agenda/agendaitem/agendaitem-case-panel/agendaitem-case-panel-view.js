import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument subcase
 * @argument agendaitem
 * @argument agenda
 * @argument newsletterInfo
 * @argument allowEditing
 * @argument onClickEdit
 */
export default class AgendaitemCasePanelView extends Component {
  @tracked case;
  @tracked agendaItemType;

  constructor() {
    super(...arguments);
    this.loadCase.perform();
    this.agendaItemType.perform();
  }

  get isRemark() {
    return this.agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.REMARK;
  }

  @task
  *loadCase() {
    if (this.args.subcase) {
      this.case = yield this.args.subcase.case;
    }
  }

  @task
  *loadAgendaItemType() {
    if (this.args.agendaitem) {
      this.agendaItemType = yield this.args.agendaitem.type;
    }
  }
}
