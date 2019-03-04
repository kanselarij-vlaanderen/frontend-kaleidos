import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Component.extend({
  store: inject(),
  actions: {
    selectAllSubCases(subcases) {
      //this.typeChanged(type);
    },
    selectPostponedSubcase(subcase) {
      this.selectSubcase(subcase, "postponed");
    }
  },
  async didInsertElement() {
    this._super(...arguments);
    const subcases = await this.store.query('subcase', {
      filter: {
        ":has:agendaitems" : "yes"
      },
      include:['agendaitems']
    });
    this.set('subcases', subcases);
  },
  postponedSubcases: computed('subcases', async function () {

    const subcases = await this.get('subcases');
    const postponed = A([]);

    await subcases.forEach(async (subcase) => {
      let agendaitems = await subcase.get('agendaitem');
      if (!isEmpty(agendaitems)){
        const hasPostponed = agendaitems.map(item => item.get('postponedTo'))
        if(hasPostponed.includes(true)){
          postponed.pushObject(subcase);
        }
      }
    });

    return postponed;
  })
});

// The helper function
async function filter(arr, callback) {
  const fail = Symbol()
  return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i=>i!==fail)
}
