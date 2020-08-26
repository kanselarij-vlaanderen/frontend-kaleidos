import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class AgendaItemNav extends Component {
  @service currentSession;

  @tracked subcaseExists = false;
  @tracked decisionsExist = false;
  @tracked meetingMinutesExist = false;
  @tracked newsItemExists = false;
  @tracked pressAgendaItemExists = false;

  get agendaItem() {
    return this.args.agendaItem;
  }

  constructor() {
    super(...arguments);
    this.checkExistance();
  }

  @action
  async checkExistance() {
    const agendaActivity = await this.agendaItem.get('agendaActivity');
    if (agendaActivity) {
      const subcase = await agendaActivity.get('subcase');
      this.subcaseExists = isPresent(subcase);
    } else {
      this.subcaseExists = false;
    }
    this.decisionsExist = isPresent(await this.agendaItem.get('treatments'));
    if (this.decisionsExist) { // Treatment and decision activity are currently one entity in implementation
      const treatment = (await this.agendaItem.get('treatments')).firstObject;
      const nli = await treatment.get('newsletterInfo');
      this.newsItemExists = isPresent(nli);
    } else {
      this.newsItemExists = false;
    }
    this.meetingMinutesExist = isPresent(await this.agendaItem.get('meetingRecord'));
    this.pressAgendaItemExists = isPresent((this.agendaItem.titlePress && this.agendaItem.textPress));
  }
}
