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

  defaultAgendaitemSubroute = 'agenda.agendaitems.agendaitem.index';
  @tracked currentRouteName;
  @tracked subcase;
  @tracked newsletterIsVisible;
  @tracked isRetractedOrPostponed = false;

  constructor() {
    super(...arguments);

    // Keeping track of the current route name for rerouting
    // from one agendaitem to another while keeping the selected subroute.
    //
    // Note: we tried defining a getter around this.route.currentRouteName before,
    // but that approach didn't work since it gets messed up by intermediate loading routes
    this.currentRouteName = this.defaultAgendaitemSubroute;
    this.router.on('routeDidChange', (transition) => {
      if (transition.to.name && transition.to.name.startsWith('agenda.agendaitems.agendaitem.')) {
        this.currentRouteName = transition.to.name;
      } else {
        this.currentRouteName = this.defaultAgendaitemSubroute;
      }
    });
  }

  get class() {
    const classes = [];
    if (this.args.isActive) {
      classes.push('vlc-agenda-detail-sidebar__sub-item--active');
    }
    if (this.isRetractedOrPostponed) {
      classes.push('auk-u-opacity--1/3');
    }
    return classes.join(' ');
  }

  @dropTask
  *lazyLoadSideData() {
    yield timeout(350);
    const tasks = [
      this.loadNewsletterVisibility,
      this.loadSubcase,
      this.loadDecisionActivity
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
    // not all agendaitems have treatments (mainly in legacy)
    const newsletterInfo = yield treatment?.newsletterInfo;
    if (newsletterInfo) {
      this.newsletterIsVisible = newsletterInfo.inNewsletter;
    } else {
      this.newsletterIsVisible = false;
    }
  }

  @task
  *loadDecisionActivity() {
    const treatment = yield this.args.agendaitem.treatment;
    const decisionActivity = yield treatment?.decisionActivity;
    const drc = yield decisionActivity?.decisionResultCode;
    this.isRetractedOrPostponed = drc?.isPostponed | drc?.isRetracted;
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
