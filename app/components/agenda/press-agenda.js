import Component from '@ember/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PressAgenda extends Component {
  currentSession = service();

  classNames = ['auk-u-m-8', 'vlc-padding-bottom--large'];

  isEditing = false;

  @action
  // eslint-disable-next-line class-methods-use-this
  toggleIsEditing(agendaitem) {
    agendaitem.set('isEditing', true);
  }
}
