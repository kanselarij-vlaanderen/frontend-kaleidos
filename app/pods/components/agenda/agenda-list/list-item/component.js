import Component from '@ember/component';
import { action, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default class ListItem extends Component {
  @service store;
  @service sessionService;
  @service('current-session') currentSessionService;
  @service agendaService;
  @service toaster;

  classNameBindings = [
    'isActive:vlc-agenda-items__sub-item--active',
    'isClickable::not-clickable',
    'agendaitem.retracted:vlc-u-opacity-lighter',
    'isNew:vlc-agenda-items__sub-item--added-item'
  ];

  tagName = 'div';
  isClickable = true;
  hideLabel = true;
  isShowingChanges = null;
  renderDetails = false;

  @alias('sessionService.selectedAgendaItem') selectedAgendaItem;
  @alias('sessionService.currentAgenda') currentAgenda;
  @alias('agendaitem.checkAdded') isNew;

  @computed('agendaitem.formallyOk')
  get formallyOk() {
    return this.agendaitem.get('formallyOk');
  }

  @computed('agendaitem')
  get agenda() {
    return this.get('agendaitem.agenda.name');
  }

  @computed('agendaitem')
  get subcase() {
    return this.getSubcase();
  }

  @computed('agendaitem.documentVersions.@each')
  get documents() {
    if (this.get('selectedAgendaItem')) {
      return null;
    }
    return this.get('agendaitem.documents');
  }

  @computed('agendaitem.id', 'selectedAgendaItem.id')
  get isActive() {
    return this.get('agendaitem.id') === this.get('selectedAgendaItem.id');
  }

  // Disable lazy partial rendering when deleting
  @computed('agendaitem.aboutToDelete')
  get aboutToDelete() {
    if (this.agendaitem) {
      return this.agendaitem.get('aboutToDelete');
    }
    return null;
  }

  async getSubcase() {
    const agendaActivity = await this.agendaitem.get('agendaActivity');
    if (agendaActivity) {
      return await agendaActivity.get('subcase');
    } else {
      return null;
    }
  }

  /* Begin lazy partial rendering

     This implementation of lazy partial rendering uses an
     IntersectionObserver to figure out if we're currently rendering.
     Part of the content is hidden when we are not in view to easen
     the browser's load and to substantially limit the amount of calls
     happening to the backend on largerAgenda’s.
   */
  didEnterViewport() {
    this.set('renderDetails', true);
  }

  didExitViewport() {
    this.set('renderDetails', false);
  }

  didInsertElement() {
    try {
      let options = {
        root: document.querySelector('body'),
        rootMargin: '5px',
        threshold: [0, 1]
      };

      let intersectionObserver = new IntersectionObserver(this.checkElementPosition.bind(this), options);
      this.set('intersectionObserver', intersectionObserver);
      intersectionObserver.observe(this.element);
    } catch (e) {
      this.set('renderDetails', true);
    }
  }

  willDestroyElement() {
    this.get('intersectionObserver').unobserve(this.element);
  }

  checkElementPosition(entries) {
    for (let entry of entries) {
      if (entry.isIntersecting) {
        this.didEnterViewport();
      } else {
        this.didExitViewport();
      }
    }
  }
  // End lazy partial rendering

  @action
  async setAction(item) {
    // this.set('isLoading', true);
    const uri = item.get('uri');
    this.agendaitem.set('formallyOk', uri);
    await this.agendaitem
      .save()
      .catch(() => {
        this.toaster.error();
      });
  }

  @action
  async openAgendaItem() {
    if (!this.isEditingOverview && !this.isComparing) {
      const agendaitem = await this.store.findRecord('agendaitem', this.get('agendaitem.id'));
      this.selectAgendaItem(agendaitem);
    }
  }
}
