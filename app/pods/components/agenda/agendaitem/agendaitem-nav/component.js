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

  @tracked pressAgendaitemExists = false;

  get agendaitem() {
    return this.args.agendaitem;
  }
  constructor() {
    super(...arguments);
    this.checkExistance();
  }

  @action
  async checkExistance() {
    // await agendaitem.get('agendaActivity.subcase') returns undefined
    const agendaActivity = await this.agendaitem.get('agendaActivity');
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
    this.meetingMinutesExist = isPresent(await this.agendaitem.get('meetingRecord'));
    this.pressAgendaitemExists = isPresent((this.agendaitem.titlePress && this.agendaitem.textPress));
  }
}
