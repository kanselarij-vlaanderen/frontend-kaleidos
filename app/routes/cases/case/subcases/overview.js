import Route from '@ember/routing/route';
import { hash } from 'rsvp';

const phasesCodes = [
  {
    label: "principële goedkeuring"
  }
];

export default Route.extend({
  async model() {
    const caze = this.modelFor('cases.case');

    let subcases = await this.store.query('subcase', {
      filter: {
        case: { id: caze.get('id') },
        "is-archived": false,
      },
      include: "phases",
      sort: 'created'
    });

    if (!subcases) {
      return hash({
        subcases: [],
        case: caze
      });
    }
    let counter = 0;
    for (let i = 0; i < subcases.length; i++) {

      const subcase = await subcases.objectAt(i);

      let subcasePhaseLabel = 'In functie van ';

      const subcaseTypeLabel = await subcase.get('type');
      if(subcaseTypeLabel){
        if (subcaseTypeLabel.get('label') === phasesCodes[0].label) {
          if (counter === 0) {
            counter++;
            subcase.set('phaseLabel', `${subcasePhaseLabel} ${counter}ste ${subcaseTypeLabel.label}`)
          } else if (counter > 0) {
            counter++;
            subcase.set('phaseLabel', `${subcasePhaseLabel} ${counter}de ${subcaseTypeLabel.label}`)
          }
        } else {
          subcase.set('phaseLabel', `${subcasePhaseLabel} ${subcaseTypeLabel.label}`)
        }
      }
    }

    return hash({
      subcases: subcases.toArray().reverse(),
      case: caze
    });
  },

  actions: {
    refresh() {
      this.refresh();
    }
  }

});
