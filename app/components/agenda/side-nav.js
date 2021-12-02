import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaSideNavComponent extends Component {
  /**
   * @argument meeting
   * @argument currentAgenda
   * @argument reverseSortedAgendas
   */
  @service store;
  @tracked isCollapsedSidebar = false;

  @action
  toggleSidebar() {
    this.isCollapsedSidebar = !this.isCollapsedSidebar;
  }
}
