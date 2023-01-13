import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class NewsItemAgendaitemAgendaitemsAgendaController extends Controller {

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
  async openFullscreenEdit() {
    await this.model?.preEditOrSaveCheck();
    this.isFullscreen = true;
    this.isEditing = true;
  }

  @action
  async openEdit() {
    await this.model?.preEditOrSaveCheck();
    this.isFullscreen = false;
    this.isEditing = true;
  }

  @action
  closeEdit(wasNewsItemNew) {
    this.isEditing = false;
    if (wasNewsItemNew) {
      this.router.refresh();
    }
  }

  @task
  *saveNewsItem(newsItem, wasNewsItemNew) {
    yield newsItem.save();
    this.isEditing = false;
    if (wasNewsItemNew) {
      this.router.refresh();
    }
  }

  @action
  dismissNotaModifiedWarning() {
    this.hideNotaModificationWarning = true;
  }
}
