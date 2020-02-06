import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
  store: inject(),
  sessionService: inject(),
  globalError: inject(),
  classNameBindings: [
    'isActive:vlc-agenda-items__sub-item--active',
    'isClickable::not-clickable',
    'agendaitem.retracted:transparant',
    'isPostponed:transparant',
    'isNew:vlc-agenda-items__sub-item--added-item'
  ],
  tagName: 'a',
  selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
  isClickable: true,
  hideLabel: true,
  isShowingChanges: null,

  init() {
    this._super(...arguments);
    observer(
      'agendaitem.postponedTo',
      async function() {
        const postponed = await this.get('agendaitem.postponedTo');
        if (!this.get('isDestroyed')) {
          this.set('isPostponed', !!postponed);
        }
      }
    );
  },

  formallyOk: computed('agendaitem.formallyOk', function() {
    return this.agendaitem.get('formallyOk');
  }),

  agenda: computed('agendaitem', function() {
    return this.get('agendaitem.agenda.name');
  }),

  documents: computed('agendaitem.documentVersions.@each', function() {
    if (this.get('selectedAgendaItem')) {
      return;
    }
    return this.get('agendaitem.documents');
  }),

  isActive: computed('agendaitem.id', 'selectedAgendaItem.id', function() {
    return this.get('agendaitem.id') === this.get('selectedAgendaItem.id');
  }),

  isNew: alias('agendaitem.checkAdded'),

  async click() {
    if (!this.isEditingOverview && !this.isComparing) {
      const agendaitem = await this.store.findRecord('agendaitem', this.get('agendaitem.id'));
      this.selectAgendaItem(agendaitem);
    }
  },

  // Disable lazy partial rendering when deleting
  aboutToDelete: computed('agendaitem.aboutToDelete', function() {
    if (this.agendaitem) {
      return this.agendaitem.get('aboutToDelete');
    }
  }),

  /* Begin lazy partial rendering

     This implementation of lazy partial rendering uses an
     IntersectionObserver to figure out if we're currently rendering.
     Part of the content is hidden when we are not in view to easen
     the browser's load and to substantially limit the amount of calls
     happening to the backend on largerAgenda’s.
   */
  renderDetails: false,
  didEnterViewport() {
    this.set("renderDetails", true);
  },
  didExitViewport() {
    this.set("renderDetails", false);
  },
  didInsertElement() {
    try {
      let options = {
        root: document.querySelector("body"),
        rootMargin: "5px",
        threshold: [0,1]
      };

      let intersectionObserver = new IntersectionObserver(this.checkElementPosition.bind(this), options);
      this.set('intersectionObserver', intersectionObserver);
      intersectionObserver.observe(this.element);
    } catch(e) {
      this.set('renderDetails', true);
    }
  },
  willDestroyElement() {
    this.get('intersectionObserver').unobserve(this.element);
  },
  checkElementPosition(entries) {
    for( let entry of entries ) {
      if( entry.isIntersecting ) {
        this.didEnterViewport();
      } else {
        this.didExitViewport();
      }
    }
  },
  // End lazy partial rendering

  actions: {
    async setAction(item) {
      // this.set('isLoading', true);
      const uri = item.get('uri');
      this.agendaitem.set('formallyOk', uri);
      this.agendaitem
        .save()
        .catch((error) => {
          this.globalError.handleError(error);
        });
    },
  },
});
