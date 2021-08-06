/* eslint-disable class-methods-use-this */
// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  computed, action
} from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/require-tagless-components
export default class AgendaDecisions extends Component {
  isEditing = false;

  @service('current-session') session;

  @computed('definite')
  get allowEditing() {
    return this.definite === 'false';
  }

  @action
  close() {
    this.closeModal();
  }

  @action
  toggleIsEditing(treatment) {
    treatment.toggleProperty('isEditing');
  }
}
