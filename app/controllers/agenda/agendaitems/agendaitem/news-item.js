import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';

export default class NewsItemAgendaitemAgendaitemsAgendaController extends Controller {
  @service router;
  @service currentSession;
  @service preventUnload;

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

  get showBeingEditedByWarning() {
    return (
      this.currentSession.may('manage-news-items') &&
      !this.isEditing &&
      this.model &&
      this.model.isBeingEditedBy?.id &&
      this.model.isBeingEditedBy.id != this.currentSession.user.id
    );
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
  async stopEditing() {
    if (!this.model) {
      // there is no model here on first creation.
      const agendaitemTreatment = await this.agendaitem.treatment;
      const newsItem = await agendaitemTreatment.belongsTo('newsItem').reload();
      await newsItem?.stopEditingOnCancel(this.currentSession.user);
    } else {
      await this.model.stopEditingOnCancel(this.currentSession.user);
    }
    this.isEditing = false;
    this.preventUnload.disable();
    this.router.refresh('agenda.agendaitems.agendaitem.news-item');
  }

  @task
  *closeEdit(wasNewsItemNew) {
    if (wasNewsItemNew) {
      this.isEditing = false;
      this.router.refresh('agenda.agendaitems.agendaitem.news-item');
    } else {
      yield this.stopEditing();
    }
  }

  @task
  *saveNewsItem(newsItem, wasNewsItemNew) {
    yield newsItem.stopEditingOnSave();
    this.isEditing = false;
    this.preventUnload.disable();
    if (wasNewsItemNew) {
      this.router.refresh('agenda.agendaitems.agendaitem.news-item');
    }
  }

  @action
  dismissNotaModifiedWarning() {
    this.hideNotaModificationWarning = true;
  }
}
