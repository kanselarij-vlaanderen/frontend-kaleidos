import Controller from '@ember/controller';

export default Controller.extend({
  isAddingNewMinister: false,
  isAddingMandate: false,
  isEditingMandatee: false,
  isManagingDocumentTypes: false,
  isManagingSubcaseTypes: false,
  isManagingIseCodes: false,
  isManagingFunctions: false,
  isManagingSignature: false,

  actions: {
    toggleProperty(prop) {
      this.toggleProperty(prop);
    }
  }
});
