import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';

export default class ListItem extends Component {
  /**
   * INFO arguments from parent.
   *
   * @agendaitem={{agendaitem}}
   * @isEditingOverview={{isEditingOverview}}
   * @selectAgendaItem={{action "selectAgendaItemAction"}}
   */

  @service sessionService;
  @service('current-session') currentSessionService;

  @alias('sessionService.currentAgenda') currentAgenda;
  @alias('args.agendaitem.checkAdded') isNew;
  @alias('args.agendaitem.agendaActivity.subcase') subcase;

  hideLabel = true;
  isShowingChanges = null;

  @tracked renderDetails = null;
  @tracked retracted = this.args.agendaitem.retracted || false;
  @tracked aboutToDelete = this.args.agendaitem.aboutToDelete || null;
  @tracked formallyOk = this.args.agendaitem.formallyOk || null;

  get classNameBindings() {
    return `
    ${this.retracted ? 'vlc-u-opacity-lighter' : ''}
    ${this.isNew ? 'vlc-agenda-items__sub-item--added-item' : ''}
    `
  }

  @action
  onEnter() {
    setTimeout(() => {
      this.renderDetails = true;
    }, 500)
  }

  @action
  onExit() {
    this.renderDetails = false;
  }

  @action
  async setAction(item) {
    const uri = item.get('uri');
    this.args.agendaitem.formallyOk = uri;
    await this.args.agendaitem
      .save()
      .catch(() => {
        this.toaster.error();
      });
  }

  @action
  async openAgendaItem() {
    if (!this.isEditingOverview && !this.isComparing) {
      this.args.selectAgendaItem(this.args.agendaitem);
    }
  }
}
