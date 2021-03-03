import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AgendaAgendaitemsController extends Controller {
  queryParams = [{
    filter: {
      type: 'string',
    },
    showModifiedOnly: {
      type: 'boolean',
    },
  }];

  @service sessionService;
  @service agendaService;

  @tracked filter;
  @tracked showModifiedOnly;
}
