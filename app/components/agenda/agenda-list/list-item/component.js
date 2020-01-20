import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
  store: inject(),
  sessionService: inject(),
  globalError: inject(),
  classNameBindings: ['extraAgendaItemClass'],
  tagName: 'a',
  selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
  isClickable: true,
  hideLabel: true,
  isShowingChanges: null,

  formallyOk: computed('agendaitem.formallyOk', function() {
    return this.agendaitem.get('formallyOk');
  }),

  extraAgendaItemClassObserver: on(
    'init',
    observer(
      'agendaitem',
      'selectedAgendaItem',
      'isClickable',
      'agendaitem.retracted',
      'agendaitem.checkAdded',
      'agendaitem.postponedTo',
      async function() {
        let clazz = '';
        if (this.get('agendaitem.id') == this.get('selectedAgendaItem.id')) {
          clazz += 'vlc-agenda-items__sub-item--active ';
        }

        if (!this.get('isClickable')) {
          clazz += ' not-clickable ';
        }

        const retracted = this.get('agendaitem.retracted');
        const postponed = await this.get('agendaitem.postponedTo');

        if (retracted || postponed) {
          clazz += ' transparant';
        }
        const added = this.get('agendaitem.checkAdded');
        if (added) {
          clazz += ' vlc-agenda-items__sub-item--added-item';
        }

        if (!this.get('isDestroyed')) {
          this.set('extraAgendaItemClass', clazz);
        }
      }
    )
  ),

  agenda: computed('agendaitem', function() {
    return this.get('agendaitem.agenda.name');
  }),

  documents: computed('agendaitem.documentVersions.@each', function() {
    if (this.get('selectedAgendaItem')) {
      return;
    }
    return this.get('agendaitem.documents');
  }),

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
