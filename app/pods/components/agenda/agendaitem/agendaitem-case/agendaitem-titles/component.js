import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaitemTitles extends Component {
  classNames = ['auk-u-mb-8'];

  @tracked showLoader = false;

  @service currentSession;

  @service publicationService;

  @service router;

  @action
  toggleIsEditingAction() {
    this.args.toggleIsEditing();
  }

  @action
  async startPublication() {
    this.showLoader = true;
    const _case = await this.args.agendaitem.get('case');
    const newPublication = await this.publicationService.createNewPublication(0, _case.id);
    this.showLoader = false;
    this.router.transitionTo('publications.publication.case', newPublication.id);
  }
}
