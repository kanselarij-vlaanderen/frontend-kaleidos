import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AgendaAgendaitemsAgendaitemController extends Controller {
  @service currentSession;

  @tracked meeting;
  @tracked subcaseExists;
  @tracked decisionsExist;
  @tracked newsItemExists;
  @tracked pressAgendaitemExists;
}
