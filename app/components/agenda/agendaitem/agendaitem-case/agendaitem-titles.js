import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaitemTitles extends Component {
  @service currentSession;
  @service publicationService;
  @service router;

  @tracked showLoader = false;

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

  @action
  async startPublication() {
    this.showLoader = true;
    const _case = await this.args.subcase.get('case');
    const newPublicationNumber = await this.publicationService.getNewPublicationNextNumber();
    const newPublication = await this.publicationService.createNewPublication(newPublicationNumber, '', _case.id);
    this.showLoader = false;
    this.router.transitionTo('publications.publication.case', newPublication.id);
  }
}
