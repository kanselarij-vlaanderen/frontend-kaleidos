import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  task,
  lastValue
} from 'ember-concurrency-decorators';

export default class AgendaitemTitles extends Component {
  @service currentSession;
  @service publicationService;
  @service router;

  @lastValue('loadCase') case;

  @tracked showLoader = false;

  constructor() {
    super(...arguments);
    this.loadCase.perform();
  }

  @action
  toggleIsEditingAction() {
    this.args.toggleIsEditing();
  }

  @task
  *loadCase() {
    const _case = yield this.args.subcase.case;
    return _case;
  }
}
