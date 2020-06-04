import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { updateModifiedProperty } from 'fe-redpencil/utils/modification-utils';

export default class AgendaItemPress extends Component {
  @service currentSession;

  agendaitem = null;
  isEditing = false;

  @computed('agendaitem')
  get title() {
    return this.agendaitem.get('subcase.title');
  }

  @action
  async toggleIsEditing() {
    const agendaitem = this.get('agendaitem');
    const agenda = await this.get('agendaitem.agenda');
    let text = agendaitem.get('textPress');
    if (!text) {
      const mandatees = await agendaitem.get('mandatees');
      // TODO KAS-1425 get the active phase if we still use the agenda-item-press component
      // const phases = await agendaitem.get('phases');
      let phase = '';
      // if (phases && phases.length > 0) {
      //   phase = await phases.get('firstObject').get('code.label');
      // }
      let titles = [];
      if (mandatees) {
        titles = mandatees.map((mandatee) => mandatee.get('title'));
      }
      const pressText = `${agendaitem.get('shortTitle')}\n${titles.join('\n')}\n${phase}`
      agendaitem.set('textPress', pressText);
      await agendaitem.save().then(() => {
        updateModifiedProperty(agenda);
      });
    }
    this.toggleProperty('isEditing');
  }
}
