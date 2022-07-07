import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class NewsItemAgendaitemAgendaitemsAgendaController extends Controller {
  @service store;
  @service newsletterService;
  @service currentSession;

  @tracked agendaitem;
  @tracked agendaItemTreatment;
  @tracked newsletterInfo;
  @tracked notaModifiedTime = null;

  @tracked isEditing = false;
  @tracked isEditingFullscreen = false;
  @tracked notaModifiedWarningConfirmed = false;

  // Nota changed since last newsitem edit
  get notaHasChanged() {
    const modifiedNliTime = this.newsletterInfo.modified;
    if (modifiedNliTime && this.notaModifiedTime) {
      return modifiedNliTime < this.notaModifiedTime;
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
  startEditingFullscreen() {
    this.isEditing = true;
    this.isEditingFullscreen = true;
  }

  @action
  stopEditing() {
    this.isEditing = false;
    this.isEditingFullscreen = false;
  }

  @action
  async createAndStartEditing() {
    this.newsletterInfo = await this.newsletterService.createNewsItemForAgendaitem(this.agendaitem);
    this.isEditing = true;
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
