import Component from '@ember/component';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed, get } from '@ember/object';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-u-spacer-extended-bottom-l'],
  store: inject(),

  mandateeApprovals: computed('item.{mandatees.[],approvals.@each.mandatee}', async function () {
    const mandatees = await get(this, 'item.mandatees');
    const approvals = await get(this, 'item.approvals');
    return mandatees.map((mandatee) => {
      const approvalForMandatee = this.getApprovalForMandatee(mandatee, approvals);

      return {
        mandatee,
        approval: approvalForMandatee,
        checked: !!approvalForMandatee,
      };
    });
  }),

  getApprovalForMandatee: (mandatee, approvals) => approvals.find((approval) => {
    return get(approval, 'mandatee.id') === get(mandatee, 'id');
  }),

  actions: {
    async saveChanges() {
      this.set('isLoading', true);

      await Promise.all(get(this, 'item.approvals').map(async (approval) => {
        return await approval.save();
      }));

      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    },

    async toggleApproved(mandatee, approval) {
      const approvals = get(this, 'item.approvals');

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
          created: moment().utc().toDate(),
          agendaitem: get(this, 'item'),
        });

        await approvals.addObject(approvalToCreate);
      }
    },

    async cancelEditing() {
      this.set('isLoading', true);
      const { item } = this;
      const approvals = await item.get('approvals');
      approvals.map((approval) => {
        approval.rollbackAttributes();
      });
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    },

    async toggleIsEditing() {
      this.toggleProperty('isEditing');
    }
  }
});
