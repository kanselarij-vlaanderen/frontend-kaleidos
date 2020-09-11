import Component from '@ember/component';
import { inject } from '@ember/service';
import {
  computed, get
} from '@ember/object';
import moment from 'moment';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-bottom-l'],
  store: inject(),
  currentSession: inject(),

  mandateeApprovals: computed('agendaitem.{mandatees.[],approvals.@each.mandatee}', async function() {
    const mandatees = await get(this, 'agendaitem.mandatees');
    const approvals = await get(this, 'agendaitem.approvals');
    return mandatees.map((mandatee) => {
      const approvalForMandatee = this.getApprovalForMandatee(mandatee, approvals);

      return {
        mandatee,
        approval: approvalForMandatee,
        checked: !!approvalForMandatee,
      };
    });
  }),

  getApprovalForMandatee: (mandatee, approvals) => approvals.find((approval) => get(approval, 'mandatee.id') === get(mandatee, 'id')),

  actions: {
    async saveChanges() {
      this.set('isLoading', true);

      await Promise.all(get(this, 'agendaitem.approvals').map(async(approval) => {
        const savedApproval = await approval.save();
        return savedApproval;
      }));

      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    },

    async toggleApproved(mandatee, approval) {
      const approvals = get(this, 'agendaitem.approvals');

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
        const approvalToCreate = get(this, 'store').createRecord('approval', {
          mandatee,
          created: moment().utc()
            .toDate(),
          agendaitem: get(this, 'agendaitem'),
        });

        await approvals.addObject(approvalToCreate);
      }
    },

    async cancelEditing() {
      this.set('isLoading', true);
      const {
        agendaitem,
      } = this;
      const approvals = await agendaitem.get('approvals');
      approvals.map((approval) => {
        approval.rollbackAttributes();
        return approval;
      });
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    },

    async toggleIsEditing() {
      this.toggleProperty('isEditing');
    },
  },
});
