// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/require-tagless-components
export default class PressAgenda extends Component {
  @service currentSession;

  classNames = ['auk-u-m-8', 'vlc-padding-bottom--large'];

  isEditing = false;

  @action
  // eslint-disable-next-line class-methods-use-this
  toggleIsEditing(agendaitem) {
    agendaitem.set('isEditing', true);
  }
}
