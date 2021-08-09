// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import {
  action, computed
} from '@ember/object';
import { inject as service } from '@ember/service';
import { updateModifiedProperty } from 'frontend-kaleidos/utils/modification-utils';

// TODO: octane-refactor
// eslint-disable-next-line ember/require-tagless-components
export default class AgendaitemPress extends Component {
  @service currentSession;

  agendaitem = null;

  isEditing = false;

  @computed('agendaitem')
  get title() {
    return this.agendaitem.get('title');
  }

  @action
  async toggleIsEditing() {
    const agendaitem = this.get('agendaitem');
    const agenda = await this.get('agendaitem.agenda');
    const text = agendaitem.get('textPress');
    if (!text) {
      const mandatees = await agendaitem.get('mandatees');
      let titles = [];
      if (mandatees) {
        titles = mandatees.map((mandatee) => mandatee.get('title'));
      }
      const pressText = `${agendaitem.get('shortTitle')}\n${titles.join('\n')}`;
      agendaitem.set('textPress', pressText);
      await agendaitem.save().then(() => {
        updateModifiedProperty(agenda);
      });
    }
    this.toggleProperty('isEditing');
  }
}
