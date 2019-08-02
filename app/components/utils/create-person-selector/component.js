import Component from "@ember/component";
import ModelSelectorMixin from "fe-redpencil/mixins/model-selector-mixin";

export default Component.extend(ModelSelectorMixin, {
  classNames: ["vlc-input-field-block"],
  classNameBindings: [
    "isCreatingPerson:vl-u-bg-alt",
    "isCreatingPerson:no-margin",
    "isCreatingPerson:padding-small"
  ],
  searchField: "first-name",
  modelName: "person",
  propertyToShow: "nameToDisplay",
  isCreatingPerson: false,
  firstName: null,
  lastName: null,

  clearValues() {
    this.set("isCreatingPerson", false);
    this.set("firstName", null);
    this.set("lastName", null);
    this.set("isLoading", false);
  },

  actions: {
    toggleIsCreatingPerson() {
      this.toggleProperty("isCreatingPerson");
    },

    resetValuesAndCancelCreation() {
      this.clearValues();
    },

    createPerson() {
      const { firstName, lastName } = this;
      const person = this.store.createRecord("person", {
        firstName,
        lastName
      });
      person.save().then(() => {
        this.findAll.perform();
        this.clearValues();
      });
    }
  }
});
