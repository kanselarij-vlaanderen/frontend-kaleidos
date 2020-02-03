import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { sort } from '@ember/object/computed';
import { A } from '@ember/array';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

let equalContentArrays = function(a, b) {
  if (a.length === b.length) {
    return a.every(elem => b.includes(elem));
  } else {
    return false;
  }
};

export default Controller.extend(isAuthenticatedMixin, {
  routing: inject('-routing'),
  itemsSortDefinition: Object.freeze(['priority:asc', 'subPriority:asc']),
  agendaItemsSorted: sort('model', 'itemsSortDefinition'),
  meeting: null,

  agendaItemGroups: computed('agendaItemsSorted.@each.submitters', async function () {
    let agendaItems = this.get('agendaItemsSorted');
    if (agendaItems.length === 0) {
      return [];
    } else {
      let currentSubmittersArray = await agendaItems.firstObject.submitters;
      let currentItemArray = A([]);
      let groups = [];
      groups.pushObject(currentItemArray);
      for (var i = 0; i < agendaItems.length; i++) {
        let item = agendaItems.objectAt(i);
        let subm = await item.submitters;
        if (equalContentArrays(currentSubmittersArray, subm)) {
          currentItemArray.pushObject(item);
        } else {
          currentItemArray = A([item]);
          groups.pushObject(currentItemArray);
          currentSubmittersArray = subm;
        }
      }
      return groups;
    }
  }),

  agendaitemsClass: computed('routing.currentRouteName', function () {
    const { routing } = this;
    if (routing.get('currentRouteName').startsWith('oc.meetings.meeting.agendaitems.agendaitem')) {
      return "vlc-panel-layout__agenda-items";
    } else  {
      return "vlc-panel-layout-agenda__detail vl-u-bg-porcelain";
    }
  }),

  actions: {

    selectAgendaItem(agendaitem) {
      this.transitionToRoute('oc.meetings.meeting.agendaitems.agendaitem', agendaitem);
    },

    searchAgendaItems(value) {
      this.set('filter', value);
    },

    updateModel() {
      this.get('model').update();
    },

  }
});
