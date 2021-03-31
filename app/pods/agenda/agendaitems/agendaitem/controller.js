import { tracked } from '@glimmer/tracking';
import AgendaitemsAgendaController from 'frontend-kaleidos/pods/agenda/agendaitems/index/controller';

export default class AgendaAgendaitemsAgendaitemController extends AgendaitemsAgendaController {
  @tracked announcements;
  @tracked newItems;
}
