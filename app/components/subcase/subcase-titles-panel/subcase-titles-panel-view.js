import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument subcase
 * @argument allowEditing
 * @argument onClickEdit
 */
export default class SubcaseTitlesPanelView extends Component {
  @service subcaseIsApproved;

  @tracked agendaItemType;
  @tracked approved;

  constructor() {
    super(...arguments);
    this.loadApproved.perform();
    this.loadAgendaItemType.perform();
  }

  get isNota() {
    return this.agendaItemType === CONSTANTS.AGENDA_ITEM_TYPES.NOTA;
  }

  @task
  *loadApproved() {
    this.approved = yield this.subcaseIsApproved.isApproved(this.args.subcase);
  }

  @task
  *loadAgendaItemType() {
    this.agendaItemType = yield this.args.subcase.agendaItemType;
  }

  get pillSkin(){
    if (this.approved) {
      return 'success';
    }
    return 'default';
  }
}
