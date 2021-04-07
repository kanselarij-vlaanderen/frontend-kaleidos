import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import {
  dropTask,
  task
} from 'ember-concurrency-decorators';

export default class SidebarItem extends Component {
  /**
   * @argument agendaitem
   * @argument isNew: boolean indicating if the item should be marked with the "new agenda-item"-icon
   * @argument isActive: boolean indicating if the component should be highlighted as the active item
   * @argument showFormallyOkStatus: boolean indicating whether to show the formally ok status
   */

  @service router;

  @alias('args.agendaitem.retracted') isRetracted;
  @tracked subcase;
  @tracked newsletterIsVisible;

  get class() {
    const classes = [];
    if (this.args.isActive) {
      classes.push('vlc-agenda-detail-sidebar__sub-item--active');
    }
    if (this.isRetracted) {
      classes.push('vlc-u-opacity-lighter');
    }
    return classes.join(' ');
  }

  @dropTask
  *lazyLoadSideData() {
    yield timeout(350);
    const tasks = [
      this.loadNewsletterVisibility,
      this.loadSubcase
    ].filter((task) => task.performCount === 0);
    yield Promise.all(tasks.map((task) => task.perform()));
  }

  @action
  cancelLazyLoad() {
    this.lazyLoadSideData.cancelAll();
  }

  @task
  *loadSubcase() {
    const agendaActivity = yield this.args.agendaitem.agendaActivity;
    if (agendaActivity) { // the approval agenda-item doesn't have agenda activity
      this.subcase = yield agendaActivity.subcase;
    }
  }

  @task
  *loadNewsletterVisibility() {
    const treatments = yield this.args.agendaitem.treatments;
    const treatment = treatments.firstObject;
    if (treatment) { // TODO: this is only the case for the first item of the agenda (approval, older data)
      const newsletterInfo = yield treatment.newsletterInfo;
      if (newsletterInfo) {
        this.newsletterIsVisible = newsletterInfo.inNewsletter;
      } else {
        this.newsletterIsVisible = false;
      }
    } else {
      this.newsletterIsVisible = false;
    }
  }

  @action
  conditionallyScrollIntoView(element) {
    if (this.args.isActive) {
      element.scrollIntoView({
        behavior: 'smooth', block: 'center',
      });
    }
  }
}
