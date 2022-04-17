import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class AgendaitemNav extends Component {
  @service currentSession;

  @tracked subcaseExists = false;
  @tracked decisionsExist = false;
  @tracked newsItemExists = false;
  @tracked pressAgendaitemExists = false;

  get routeModels() {
    return [this.args.meeting?.id, this.args.agenda?.id, this.args.agendaitem?.id];
  }

  constructor() {
    super(...arguments);
    this.checkExistence();
  }

  @action
  async checkExistence() {
    const agendaActivity = await this.args.agendaitem?.agendaActivity;
    this.decisionsExist = isPresent(await this.args.agendaitem?.treatments);
    if (!this.args.agendaitem.isApproval) {
      if (agendaActivity) {
        const subcase = await agendaActivity.get('subcase');
        this.subcaseExists = isPresent(subcase);
      } else {
        this.subcaseExists = false;
      }
      if (this.decisionsExist) { // Treatment and decision activity are currently one entity in implementation
        const treatment = (await this.args.agendaitem?.treatments)?.firstObject;
        const nli = await treatment.get('newsletterInfo');
        this.newsItemExists = isPresent(nli);
      } else {
        this.newsItemExists = false;
      }
      this.pressAgendaitemExists = isPresent((this.args.agendaitem.titlePress && this.args.agendaitem.textPress));
    }
  }
}
