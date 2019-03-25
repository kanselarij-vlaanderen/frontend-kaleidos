import Route from '@ember/routing/route';
import {hash} from 'rsvp';

const phasesCodes = [
  {
    label : "principiële goedkeuring"
  }
];

export default Route.extend({
  async model() {
    const caze = this.modelFor('cases.case');
    let subcases = await this.store.query('subcase', {
      filter: {
        case: { id: caze.get('id') }
      },
      include: "case.type,phases",
      sort: 'created'
    });

    let frequencies = {};

    for (let i = 0; i < subcases.length; i++){

      const subcase = subcases.objectAt(i);
      let subcasePhaseLabel = 'In functie van ';
      const phases = await subcase.phases;

      const code = await phases.get('firstObject').code;

      let foundCode = phasesCodes.filter(item => item.label.includes(code.label));
      if (foundCode.length === 1){
        foundCode = foundCode.objectAt(0);
        const label = foundCode.label;

        if (frequencies[label]) {
          frequencies[label] = frequencies[label] + 1;
          subcasePhaseLabel += `${frequencies[label]}de ${label}`
        } else {
          frequencies[label] = 1;
          subcasePhaseLabel += `${frequencies[label]}ste ${label}`
        }
      }else {
        subcasePhaseLabel += `${code.label}`
      }

      subcase.set('phaseLabel', subcasePhaseLabel);
      subcase.set('codes', phases.map(item => item.code.get('label')));
    }

    return hash({
      subcases: subcases.toArray().reverse(),
      case: caze
    });
  }

});
