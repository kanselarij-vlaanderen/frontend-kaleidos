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

  loadSubmitters = task(async () => {
    if (!this.args.case) {
      throw new Error('@case argument is required');
    }

    const subcases = await this.store.queryAll('subcase', {
      'filter[decisionmaking-flow][case][:id:]': this.args.case.id,
      include: 'requested-by.person',
    });

    const persons = new Set();
    await Promise.all(
      subcases.map(async (subcase) => {
        const submitter = await subcase.requestedBy;
        if (submitter) {
          const value = await submitter.person;
          const fullName = value.fullName;
          persons.add(fullName);
        }
      })
    );
    this.submitters = [...persons];
  });
}
