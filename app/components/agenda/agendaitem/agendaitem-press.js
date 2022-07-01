import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { updateModifiedProperty } from 'frontend-kaleidos/utils/modification-utils';

export default class AgendaitemPress extends Component {
  @service currentSession;

  @tracked isEditing = false;

  @action
  async toggleIsEditing() {
    const agendaitem = this.args.agendaitem;
    const agenda = await agendaitem.agenda;
    const text = agendaitem.textPress;
    if (!text) {
      const mandatees = (await agendaitem.mandatees).toArray();
      let titles = [];
      if (mandatees) {
        titles = mandatees.map((mandatee) => mandatee.title);
      }
      const pressText = `${agendaitem.shortTitle}\n${titles.join('\n')}`;
      agendaitem.textPress = pressText;
      await agendaitem.save();
      updateModifiedProperty(agenda);
    }
    this.isEditing = !this.isEditing;
  }
}
