import Component from '@ember/component';
import { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { updateModifiedProperty } from 'fe-redpencil/utils/modification-utils';

export default Component.extend(isAuthenticatedMixin, {
  agendaitem: null,
  isEditing: false,

  title: computed('agendaitem', function () {
    return this.agendaitem.get('subcase.title');
  }),

  actions: {
    async toggleIsEditing() {
      const agendaitem = this.get('agendaitem');
      const agenda = await this.get('agendaitem.agenda');
      let text = agendaitem.get('textPress');
      if (!text) {
        const mandatees = await agendaitem.get('mandatees');
        const phases = await agendaitem.get('phases');
        let phase = '';
        if (phases && phases.length > 0) {
          phase = await phases.get('firstObject').get('code.label');
        }
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
});
