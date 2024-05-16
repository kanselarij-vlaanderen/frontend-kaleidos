import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';


/**
  * @argument notaGroups: Array of AgendaitemGroup-objects
  * @argument isLoadingNotaGroups: boolean indicating whether to show the loading state for nota's
  * @argument announcements: Array of agendaitems with type announcement
  * @argument newItems: items to be marked as "new on this agenda"
  * @argument currentAgenda: the agenda that is currently open
  * @argument showModifiedOnly: if we should filter only on modified agendaitems
  * @argument toggleShowModifiedOnly: toggle the parent to set the modified filter on or off
  * @argument activeItem: the currently selected agendaitem
  */

export default class AgendaDetailSidebarComponent extends Component {
  @tracked panelOpen = false;
  panelElement = null;

  constructor() {
    super(...arguments);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.setupResponsiveFeatures();
  }

  setupResponsiveFeatures() {
    document.addEventListener('click', this.handleClickOutside);
  }

  @action
  didInsertPanel(element) {
    this.panelElement = element;
  }

  @action
  togglePanel() {
    this.panelOpen = !this.panelOpen;
  }

  @action
  closePanel() {
    this.panelOpen = false;
  }

  handleClickOutside(event) {
    if (!this.panelOpen) return;

    if (!this.panelElement.contains(event.target)) {
      this.closePanel();
    }
  }
}
