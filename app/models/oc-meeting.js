import DS from 'ember-data';
import { computed } from '@ember/object';
let { Model, attr, belongsTo, hasMany } = DS;
import { A } from '@ember/array';

let equalContentArrays = function(a, b) {
  if (a.length !== b.length) {
    return false;
  } else {
    return a.isEvery(elem => b.includes(elem));
  }
};

export default Model.extend({
  startedAt: attr('date'),
  agendaItems: hasMany('oc-agendaitem'),
	agendaItemGroups: computed('agendaItems.@each', function () {
		return this.get('agendaItems').then(async (agendaItems) => {
      if (agendaItems.length === 0) {
        return [];
      } else {
        let currentSubmittersArray = undefined;
        let currentItemArray = A([]);
        let groups = [];
        groups.append(currentItemArray);
        for (var i = 0; i < agendaItems.length; i++) {
          let subm = await agendaItems[i].get('submitters');
          if (equalContentArrays(currentSubmittersArray, subm)) {
            currentItemArray.push(agendaItems[i]);
          } else {
            currentItemArray = A([agendaItems[i]]);
            groups.append(currentItemArray);
          }
          console.log("Submitters for item:", subm);
        }
        return groups;
      }
    });
  }),

});
