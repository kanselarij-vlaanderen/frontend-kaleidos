import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';

export default class CaseController extends Controller {
  @service publicationService;

  @tracked showLoader = false;
  @tracked personModalOpen = false;
  @tracked mandateeModalOpen = false;
  @tracked isInscriptionInEditMode = false;
  @tracked isUpdatingInscription = false;


  @tracked
  contactPerson = {
    firstName: '',
    lastName: '',
    email: '',
  };

  @tracked
  contactPersonsView = {
    size: 50,
    page: 0,
    sort: '',
  };

  @action
  onFirstNameChanged(event) {
    this.contactPerson.firstName = event.target.value;
  }

  @action
  onLastNameChanged(event) {
    this.contactPerson.lastName = event.target.value;
  }

  @action
  onEmailChanged(event) {
    this.contactPerson.email = event.target.value;
  }
  @action
  onOrganisationChanged(event) {
    this.contactPerson.organisationName = event.target.value;
  }

  get getShortTitle() {
    if (this.model.case) {
      return this.model.case.shortTitle;
    }
    return '';
  }

  get getLongTitle() {
    if (this.model.case) {
      return this.model.case.title;
    }
    return '';
  }

  @action
  showContactPersonModal() {
    this.personModalOpen = true;
  }

  @action
  closeContactPersonModal() {
    this.personModalOpen = false;
  }

  @action
  putInscriptionInEditMode() {
    this.isInscriptionInEditMode = true;
  }

  @action
  cancelEditingInscription() {
    this.model.case.rollbackAttributes();
    this.putInscriptionInNonEditMode();
  }

  @action
  putInscriptionInNonEditMode() {
    this.isInscriptionInEditMode = false;
  }

  @task
  *saveInscription() {
    try {
      yield this.model.case.save();
      this.putInscriptionInNonEditMode();
    } catch {
      // Don't exit if save didn't work
    }
  }

  @action
  async addNewContactPerson() {
    this.showLoader = true;
    const contactPerson =  await this.store.createRecord('contact-person', this.contactPerson);
    await contactPerson.save();
    await this.publicationService.linkContactPersonToPublication(this.model.publicationFlow.id, contactPerson);
    this.personModalOpen = false;
    this.showLoader = false;
  }

  @action
  async deleteContactPerson(contactPerson) {
    this.showLoader = true;
    await contactPerson.destroyRecord();
    this.showLoader = false;
  }

  // Mandatee Stuff.

  @action
  showMandateeModal() {
    this.mandateeModalOpen = true;
  }

  @action
  closeMandateeModal() {
    this.mandateeModalOpen = false;
  }

  @action
  async mandateeSelectedForPublication(mandatee) {
    this.showLoader = true;
    const mandatees = this.model.publicationFlow.get('mandatees').toArray();
    mandatees.push(mandatee);
    this.model.publicationFlow.set('mandatees', mandatees);
    await this.model.publicationFlow.save();
    this.mandateeModalOpen = false;
    this.showLoader = false;
  }

  @action
  async unlinkMandateeFromPublicationFlow(mandateeToUnlink) {
    this.showLoader = true;
    const mandatees = this.model.publicationFlow.get('mandatees').toArray();
    for (let index = 0; index < mandatees.length; index++) {
      const mandatee = mandatees[index];
      if (mandateeToUnlink.id === mandatee.id) {
        mandatees.splice(index, 1);
      }
    }
    this.model.publicationFlow.set('mandatees', mandatees);
    await this.model.publicationFlow.save();
    this.mandateeModalOpen = false;
    this.showLoader = false;
  }
}
