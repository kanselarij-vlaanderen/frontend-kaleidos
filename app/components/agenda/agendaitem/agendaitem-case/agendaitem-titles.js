import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  lastValue, task
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

  @task
  *loadCase() {
    if (this.args.subcase) {
      return yield this.args.subcase.case;
    }
    return null;
  }

  @action
  startEditing() {
    this.args.toggleIsEditing();
  }
}
