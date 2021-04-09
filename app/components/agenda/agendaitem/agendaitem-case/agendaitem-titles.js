import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { alias } from '@ember/object/computed';

export default class AgendaitemTitles extends Component {
  @alias('args.agendaitem.agendaActivity.subcase') subcase;

  @tracked showLoader = false;

  @service currentSession;

  @service router;

  @action
  toggleIsEditingAction() {
    this.args.toggleIsEditing();
  }

  @action
  async redirectToSubcase() {
    const subcase = this.args.subcase;
    const _case = await subcase.get('case');
    const subcaseId = subcase.id;
    this.router.transitionTo('cases.case.subcases.subcase.overview', _case.id, subcaseId);
  }
}
