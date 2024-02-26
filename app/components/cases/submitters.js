import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CasesSubmitters extends Component {
  @service store;

  @tracked submitters = null;

  constructor() {
    super(...arguments);
    this.loadSubmitters.perform();
  }

  loadSubmitters= task(async () => {
    if (!this.args.case) {
      throw new Error('@case argument is required');
    }

    const subcases = await this.store.queryAll('subcase', {
      'filter[decisionmaking-flow][case][:id:]': this.args.case.id,
      include: 'requested-by.person',
    });

    const persons = new Set();
    subcases.forEach((subcase) => {
      const submitter = subcase.belongsTo('requestedBy').value();
      if (submitter) {
        persons.add(submitter.belongsTo('person').value().fullName);
      }
    });
    this.submitters = [...persons];
  });
}
