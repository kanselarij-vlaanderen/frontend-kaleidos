import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AgendaItemNav extends Component {
  @service currentSession;

  @tracked subcaseExists = false;
  @tracked decisionsExist = false;
  @tracked meetingMinutesExist = false;
  @tracked newsItemExists = false;
  @tracked pressAgendaItemExists = false;

  get agendaItem () {
    return this.args.agendaItem;
  }

  constructor () {
    super(...arguments);
    this.checkExistance();
  }

  async checkExistance () {
    if (await this.agendaItem.get('subcase')) {
      this.subcaseExists = true;
    }
    if (await this.agendaItem.get('subcase.decisions')) {
      this.decisionsExist = true;
    }
    if (await this.agendaItem.get('meetingRecord')) {
      this.meetingMinutesExist = true;
    }
    if (await this.agendaItem.get('subcase.newsletterInfo')) {
      this.newsItemExists = true;
    }
    if (this.agendaItem.titlePress && this.agendaItem.textPress) {
      this.pressAgendaItemExists = true;
    }
  }
}
