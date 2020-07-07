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
    // await agendaItem.get('agendaActivity.subcase') returns undefined
    const agendaActivity = await this.agendaItem.get('agendaActivity');
    if (agendaActivity) {
      const subcase = await agendaActivity.get('subcase');
      this.subcaseExists = isPresent(subcase);
      this.decisionsExist = isPresent(await subcase.get('decisions'));
      this.newsItemExists = isPresent((await subcase.get('newsletterInfo')));
    } else {
      this.subcaseExists = false;
      this.decisionsExist = false;
      this.newsItemExists = false;
    }
    this.meetingMinutesExist = isPresent(await this.agendaItem.get('meetingRecord'));
    this.pressAgendaItemExists = isPresent((this.agendaItem.titlePress && this.agendaItem.textPress));
  }
}
