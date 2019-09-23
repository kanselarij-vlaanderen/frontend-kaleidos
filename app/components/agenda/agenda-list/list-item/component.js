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

  actions: {
    async setAction(item) {
      this.set('isLoading', true);
      const uri = item.get('uri');
      this.agendaitem.set('formallyOk', uri);
      const agenda = await this.agendaitem.get('agenda');
      this.agendaitem
        .save()
        .then(() => {
          this.set('isLoading', false);
          agenda.notifyPropertyChange('agendaitems');
        })
        .catch((error) => {
          this.globalError.handleError(error);
        });
    },
  },
});
