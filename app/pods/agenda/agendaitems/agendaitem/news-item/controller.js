import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';

export default class NewsItemAgendaitemAgendaitemsAgendaController extends Controller {
  @service store;
  @service newsletterService;
  @service currentSession;

  @tracked notaModifiedTime = null;

  @tracked isEditing = false;
  @tracked notaModifiedWarningConfirmed = false;

  // Nota changed since last newsitem edit
  get notaHasChanged() {
    const modifiedNliTime = this.model.modified;
    if (modifiedNliTime && this.notaModifiedTime) {
      return moment(modifiedNliTime).isBefore(moment(this.notaModifiedTime));
    }
    return false;
  }

  @action
  confirmNotaModifiedWarning() {
    this.notaModifiedWarningConfirmed = true;
  }

  @action
  startEditing() {
    this.isEditing = true;
  }

  @action
  stopEditing() {
    if (this.model.isDeleted) {
      this.model = null;
    }
    this.isEditing = false;
  }

  @action
  async createAndStartEditing() {
    const newsItem = await this.newsletterService.createNewsItemForAgendaitem(this.agendaitem);
    this.model = newsItem;
    this.isEditing = true;
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
