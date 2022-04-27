import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgendaitemApprovalsPanel extends Component {
  @service store;
  @service currentSession;

  @tracked isEditing = false;
  @tracked isLoading = false;
  @tracked mandateeApprovals;
  @tracked approvals;


  constructor() {
    super(...arguments);
    this.loadMandateeApprovals.perform();
  }

  @task
  *loadMandateeApprovals() {
    const mandatees = yield this.args.agendaitem.mandatees;
    const agendaitemApprovals = yield this.args.agendaitem.approvals;
    this.approvals = agendaitemApprovals.toArray();
    this.mandateeApprovals = [];
    for (const mandatee of mandatees.toArray()) {
      const approvalForMandatee = yield this.findApprovalOfMandatee(mandatee);
      this.mandateeApprovals.addObject({
        mandatee,
        approval: approvalForMandatee,
      })
    }
  }

  async findApprovalOfMandatee(mandatee) {
    for (const approval of this.approvals) {
      const mandateeOfApproval = await approval.mandatee;
      if (mandateeOfApproval.id === mandatee.id) {
        return approval
      }
    }
  }

  @action
  async saveChanges() {
    this.isLoading = true;
    const approvalPromises = [];
    for (const approval of this.approvals) {
      approvalPromises.push(approval.save())
    }
    await Promise.all(approvalPromises);
    await this.loadMandateeApprovals.perform();
    this.isLoading = false;
    this.toggleIsEditing();
  }

  @action
  toggleApproved(mandateeApproval) {
    let approval = mandateeApproval.approval;
    if (approval) {
      if (!approval.isDeleted) {
        approval.deleteRecord();
      } else {
        approval.rollbackAttributes();
      }
      if (!approval.id) {
        approval.unloadRecord();
      }
    } else {
       approval = this.store.createRecord('approval', {
        mandatee: mandateeApproval.mandatee,
        created: new Date(),
        agendaitem: this.args.agendaitem,
      });
      this.approvals.push(approval);
    }
  }

  @action
  async cancelEditing() {
    this.isLoading = true;
    this.approvals.forEach((approval) => approval.rollbackAttributes());
    this.isLoading = false;
    this.toggleIsEditing();
  }

  @action
  toggleIsEditing() {
    this.isEditing = !this.isEditing;
  }
}
