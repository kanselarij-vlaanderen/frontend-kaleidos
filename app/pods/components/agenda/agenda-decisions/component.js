/* eslint-disable class-methods-use-this */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  computed, action
} from '@ember/object';

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
