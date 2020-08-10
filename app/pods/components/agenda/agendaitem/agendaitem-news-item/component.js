import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import { warn } from '@ember/debug';

export default class AgendaitemNewsItem extends Component {
  @service store;
  @service newsletterService;
  @service agendaService;
  @service sessionService;
  @service currentSession;
  @service intl;

  classNames = ['vlc-padding-bottom--large'];

  @tracked isEditing = false;
  @tracked modifiedNotaTime = null;
  @tracked showChangedNotaWarning = false;


  async didUpdateAttrs() {
    this.modifiedNotaTime = await this.agendaService.retrieveModifiedDateFromNota(this.args.agendaItem);
    if (this.notaChanged) {
      this.showChangedNotaWarning = true;
    }
  }

  // Nota changed since last newsitem edit
  get notaChanged() {
    const modifiedNliTime = this.args.newsletterInfo.modified;
    if (modifiedNliTime && this.modifiedNotaTime) {
      return moment(modifiedNliTime).isBefore(moment(this.modifiedNotaTime));
    }
    return false;
  }

  @action
  async toggleIsEditing() {
    this.set('isLoading', true);
    if (!this.newsletterInfo) {
      warn('No newsletterInfo object available!');
    }
    this.set('isLoading', false);
    this.toggleProperty('isEditing');
  }

  @action
  hideChangedNotaWarning() {
    this.showChangedNotaWarning = false;
  }
}
