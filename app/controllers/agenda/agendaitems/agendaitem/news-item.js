import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class NewsItemAgendaitemAgendaitemsAgendaController extends Controller {
  @service currentSession;

  @tracked agendaitem;
  @tracked notaModifiedTime;
  @tracked hideNotaModificationWarning = false;

  @tracked isEditing = false;
  @tracked isFullscreen = false;

  get canEditNewsletter(){
    return this.currentSession.may('manage-newsletter-infos');
  }

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
    yield newsletterItem.save();
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
