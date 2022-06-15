import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import {
  dropTask,
  task
} from 'ember-concurrency';

export default class SidebarItem extends Component {
  /**
   * @argument agendaitem
   * @argument isNew: boolean indicating if the item should be marked with the "new agenda-item"-icon
   * @argument isActive: boolean indicating if the component should be highlighted as the active item
   * @argument showFormallyOkStatus: boolean indicating whether to show the formally ok status
   */

  @service router;

  @tracked subcase;
  @tracked newsletterIsVisible;

  get isRetracted() {
      return this.args.agendaitem.retracted;
  }

  get class() {
    const classes = [];
    if (this.args.isActive) {
      classes.push('vlc-agenda-detail-sidebar__sub-item--active');
    }
    if (this.isRetracted) {
      classes.push('auk-u-opacity--1/3');
    }
    return classes.join(' ');
  }

  get defaultRoute() {
    return 'agenda.agendaitems.agendaitem.index';
  }

  /**
   * This method will get the route name for rerouting from one agendaitem to another while keeping the selected subroute.
   */
  get currentRoute() {
    // There used to be a fix here to prevent the user from getting stuck in loading by using the currentRouter property from router.
    // This fix broke after an ember update so now we default to index instead of creating a link to the /loading route.
    // A better solution would be to remember the last correct route but that would mean keeping state somewhere..
    const currentRouteName = this.router.currentRouteName;
    if (currentRouteName.includes('.loading')){
      return this.defaultRoute;
    }
    return currentRouteName;
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
    // the approval agenda-item doesn't have agenda activity
    this.subcase = yield agendaActivity?.subcase;
  }

  @task
  *loadNewsletterVisibility() {
    const treatment = yield this.args.agendaitem.treatment;
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
