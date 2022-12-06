import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class NewsItemAgendaitemAgendaitemsAgendaController extends Controller {
  @service newsletterService;
  @service router;

  @tracked agendaitem;
  @tracked notaModifiedTime;
  @tracked hideNotaModificationWarning = false;

  @tracked isEditing = false;
  @tracked isFullscreen = false;

  get notaHasChanged() {
    return this.notaModifiedTime && this.model?.modified && this.model?.modified < this.notaModifiedTime;
  }

  get showNotaModificationWarning() {
    return !this.hideNotaModificationWarning && this.notaHasChanged;
  }

  @action
  openFullscreenEdit() {
    this.isFullscreen = true;
    this.isEditing = true;
  }

  @action
  openEdit() {
    this.isFullscreen = false;
    this.isEditing = true;
  }

  @action
  closeEdit() {
    this.isEditing = false;
  }

  @task
  *saveNewsletterItem(newsletterItem) {
    const mustReloadModel = newsletterItem.isNew;
    yield this.newsletterService.saveNewsItemForAgendaitem(this.agendaitem, newsletterItem);
    this.isEditing = false;
    if (mustReloadModel) {
      this.send('reloadModel');
    }
  }

  @action
  dismissNotaModifiedWarning() {
    this.hideNotaModificationWarning = true;
  }
}
