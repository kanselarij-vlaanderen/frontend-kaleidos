import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class WebComponentsVlDecisionsColumn extends Component {
  @service store;
  @service subcaseIsApproved;

  @tracked textToShow;

  constructor() {
    super(...arguments);

    this.loadTextToShow.perform();
  }

  @task
  *loadTextToShow() {
    const agendaitem = yield this.row;
    const agendaActivity = yield agendaitem?.agendaActivity;
    const subcase = yield agendaActivity?.subcase;
    const approved = this.subcaseIsApproved.isApproved(subcase);
    if (approved) {
      this.textToShow = 'Beslist';
    }
    this.textToShow = 'Niet beslist';
  }
}
