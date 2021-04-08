import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
// import { tracked } from '@glimmer/tracking';

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

  // @tracked filter; // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  // @tracked showModifiedOnly;
}
