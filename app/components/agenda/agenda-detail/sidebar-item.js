import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout, task } from 'ember-concurrency';

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
  @tracked newsItem;
  @tracked decisionActivity;

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
    // Needed in order to change the sidebar classes when editing in the agendaitem detail route
    if (this.decisionActivity?.get('isPostponed')) {
      classes.push('auk-u-opacity--1/3');
    }
    if (this.decisionActivity?.get('isRetracted')) {
      classes.push('auk-u-opacity--1/3');
    }
    return classes.join(' ');
  }

  lazyLoadSideData = task({ drop: true }, async () => {
    await timeout(350);
    const tasks = [
      this.loadNewsItemVisibility,
      this.loadSubcase,
      this.loadDecisionActivity
    ].filter((task) => task.performCount === 0);
    await Promise.all(tasks.map((task) => task.perform()));
  });

  @action
  cancelLazyLoad() {
    this.lazyLoadSideData.cancelAll();
  }

  loadSubcase = task(async () => {
    const agendaActivity = await this.args.agendaitem.agendaActivity;
    // the approval agenda-item doesn't have agenda activity
    this.subcase = await agendaActivity?.subcase;
  });

  loadNewsItemVisibility = task(async () => {
    const treatment = await this.args.agendaitem.treatment;
    // not all agendaitems have treatments (mainly in legacy)
    this.newsItem = await treatment?.newsItem;
  });

  loadDecisionActivity = task(async () => {
    const treatment = await this.args.agendaitem.treatment;
    this.decisionActivity = await treatment?.decisionActivity;
    await this.decisionActivity?.belongsTo('decisionResultCode').reload();
  });

  @action
  conditionallyScrollIntoView(element) {
    if (this.args.isActive) {
      const container = document.getElementById('agendadetail-sidebar-container');
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset = elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);

      if (offset >= 0) { // only try to scroll downwards as the container is already scrolled to the top
        container.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
    }
  }
}
