import Route from '@ember/routing/route';
import {hash} from 'rsvp';

const phasesCodes = [
  {
    label : "principële goedkeuring"
  }
];

export default Route.extend({
  async model() {
    const caze = this.modelFor('cases.case');

    let subcases = await this.store.query('subcase', {
      filter: {
        case: { id: caze.get('id') }
      },
      include: "phases",
      sort: 'created'
    });

    let frequencies = {};

    if (!subcases){
      return hash({
        subcases: [],
        case: caze
      });
    }

    for (let i = 0; i < subcases.length; i++){

      const subcase = await subcases.objectAt(i);
      let subcasePhaseLabel = 'In functie van ';

      if (subcase){

        const phases = await subcase.get('phases');

        if (phases){

          const phase = await phases.objectAt(0);
          const code = (await phase.get('code')).toJSON();

          if (code){

            let foundCode = await phasesCodes.filter(item => item.label === code.label );

            if (foundCode.length === 1) {

              foundCode = foundCode[0];
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

            let codes = [];
            for (let x = 0; x < phases.length; x++){
              const current_phase = await phases.objectAt(x);
              const code = (await current_phase.get('code')).toJSON();
              codes.push(code.label);
            }

            subcase.set('phaseLabel', subcasePhaseLabel);
            subcase.set('codes', codes);

          }

        }

      }

    }

    return hash({
      subcases: subcases.toArray().reverse(),
      case: caze
    });
  }

});
