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
    this.subcaseExists = isPresent(await this.agendaItem.get('subcase'));
    this.decisionsExist = isPresent(await this.agendaItem.get('subcase.decisions'));
    this.meetingMinutesExist = isPresent(await this.agendaItem.get('meetingRecord'));
    this.newsItemExists = isPresent((await this.agendaItem.get('subcase.newsletterInfo')));
    this.pressAgendaItemExists = isPresent((this.agendaItem.titlePress && this.agendaItem.textPress));
  }
}
