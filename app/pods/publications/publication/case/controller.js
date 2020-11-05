import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class CaseController extends Controller {
  @service publicationService;
  @tracked isShowingPersonModal = false;
  @tracked isInscriptionInEditMode = false;
  @tracked isUpdatingInscription = false;


  @tracked
  inscription = {
    shortTitle: '',
    longTitle: '',
  };

  get getShortTitle() {
    if (this.model) {
      const caze = this.model.get('case');
      return caze.get('shortTitle');
    }
    return '';
  }

  get getLongTitle() {
    if (this.model) {
      const caze = this.model.get('case');
      return caze.get('title');
    }
    return '';
  }

  @action
  setValuesInscriptionModal() {
    this.inscription = {
      shortTitle: this.getShortTitle,
      longTitle: this.getLongTitle,
    };
  }

  @action
  showContactPersonModal() {
    this.isShowingPersonModal = true;
  }

  @action
  closeContactPersonModal() {
    this.isShowingPersonModal = false;
  }

  @action
  putInscriptionInEditMode() {
    this.setValuesInscriptionModal();
    this.isInscriptionInEditMode = true;
  }

  @action
  putInscriptionInNonEditMode() {
    this.isInscriptionInEditMode = false;
    this.setValuesInscriptionModal();
  }

  @action
  async saveInscription() {
    const newPublication = await this.publicationService.updateInscription(this.model.get('id'), this.inscription.longTitle, this.inscription.shortTitle);

    const caze = await newPublication.get('case');

    this.inscription = {
      shortTitle: caze.get('shortTitle'),
      longTitle: caze.get('title'),
    };

    this.isInscriptionInEditMode = false;
  }
}
