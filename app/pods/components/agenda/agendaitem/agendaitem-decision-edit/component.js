import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default class AgendaItemDecisionEditComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);
    this.decisionresultCodes = this.store.findAll('decision-result-code');
    console.log('this.decisionresultCodes', this.decisionresultCodes);
  }

  @action
  changeDecisionResultCode(resultCode) {
    console.log('changeDecisionResultCode', resultCode);
  }

  // @tracked isEditing = false;
  // @tracked isVerifyingDelete = null;
  // @tracked treatmentToDelete = null;
  //
  // get treatment() {
  //   return this.args.treatment;
  // }
  //
  // @action
  // toggleIsEditing() {
  //   this.isEditing = !this.isEditing;
  // }
  //
  // @action
  // promptDeleteTreatment(treatment) {
  //   this.treatmentToDelete = treatment;
  //   this.isVerifyingDelete = true;
  // }
  //
  // @action
  // async deleteTreatment() {
  //   await this.treatmentToDelete.destroyRecord();
  //   if (this.args.onDeleteTreatment) {
  //     await this.args.onDeleteTreatment(this.treatmentToDelete);
  //   }
  //   this.isVerifyingDelete = false;
  // }
  //
  // @action
  // cancel() {
  //   this.treatmentToDelete = null;
  //   this.isVerifyingDelete = false;
  // }
}
