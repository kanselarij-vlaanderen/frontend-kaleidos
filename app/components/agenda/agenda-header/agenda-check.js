import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

/**
 * @argument onSave
 * @argument onCancel
 */

export default class AgendaHeaderAgendaCheck extends Component {
  @service store;
  @service throttledLoadingService;
  @tracked notaGroups;

  @task
  cancelEditing() {
    this.args.onCancel();
  }

  @task
  saveChanges() {
    this.args.onSave();
  }
}
