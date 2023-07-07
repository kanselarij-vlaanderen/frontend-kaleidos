import Service, { inject as service } from '@ember/service';
import { uploadPiecesToSigninghub } from 'frontend-kaleidos/utils/digital-signing';
import ENV from 'frontend-kaleidos/config/environment';
import fetch from 'fetch';
import constants from 'frontend-kaleidos/config/constants';

const { MARKED, PREPARED } = constants.SIGNFLOW_STATUSES;

export default class SignatureService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service currentSession;

  async createSignFlow(signFlows, signers, approvers, notified) {
    for (let signFlow of signFlows) {
      const signSubcase = await signFlow.signSubcase;
      // Attach signers
      await Promise.all(
        signers.map((mandatee) => {
          const record = this.store.createRecord('sign-signing-activity', {
            signSubcase,
            mandatee,
          });
          return record.save();
        })
      );

      // Attach approvers
      await Promise.all(
        approvers.map((approver) => {
          const record = this.store.createRecord('sign-approval-activity', {
            approver,
            signSubcase,
          });
          return record.save();
        })
      );

      // Attach notified
      signSubcase.notified = notified;
      await signSubcase.save();
      // set creator
      const creator = await this.currentSession.user;
      signFlow.creator = creator;
      const status = await this.store.findRecordByUri('concept', PREPARED);
      signFlow.status = status;
      await signFlow.save();
    }

    // Prepare sign flow: create preparation activity and send to SH
    const response = await uploadPiecesToSigninghub(signFlows);
    if (!response.ok) {
      for (let signFlow of signFlows) {
        await this.removeSignFlow(signFlow);
      }
      throw new Error('Failed to upload piece to Signing Hub');
    }
  }

  async markDocumentForSignature(piece, decisionActivity) {
    const subcase = await decisionActivity?.subcase;
    if (subcase) {
      const decisionmakingFlow = await subcase.decisionmakingFlow;
      const _case = await decisionmakingFlow.case;
      const now = new Date();
      const status = await this.store.findRecordByUri('concept', MARKED);

      // TODO: Shouldn't the short & long title be coming from the agendaitem. Also when would show or edit this data?
      const signFlow = this.store.createRecord('sign-flow', {
        openingDate: now,
        shortTitle: _case.shortTitle,
        longTitle: _case.title,
        case: _case,
        decisionActivity,
        status: status,
      });
      await signFlow.save();
      const signSubcase = this.store.createRecord('sign-subcase', {
        startDate: now,
        signFlow: signFlow,
      });
      await signSubcase.save();
      const signMarkingActivity = this.store.createRecord(
        'sign-marking-activity',
        {
          startDate: now,
          endDate: now,
          signSubcase: signSubcase,
          piece: piece,
        }
      );
      await signMarkingActivity.save();

      return {
        signFlow,
        signSubcase,
      };
    }
  }

  async canManageSignFlow(piece) {
    // the base permission 'manage-signatures' does not cover cabinet specific requirements
    if (this.currentSession.may('manage-only-specific-signatures')) {
      const submissionActivity = await this.store.queryOne(
        'submission-activity',
        {
          filter: {
            pieces: {
              ':id:': piece?.id,
            },
          },
        }
      );
      const subcase = await submissionActivity.subcase;
      if (subcase) {
        const mandatee = await subcase.requestedBy;
        if (mandatee) {
          const currentUserOrganization = await this.currentSession
            .organization;
          const currentUserOrganizationMandatees =
            await currentUserOrganization.mandatees;
          const currentUserOrganizationMandateesUris =
            currentUserOrganizationMandatees?.map((mandatee) => mandatee.uri);
          if (currentUserOrganizationMandateesUris?.includes(mandatee.uri)) {
            return true;
          }
        }
      }
    } else {
      // default to standard permissions
      return true;
    }
    return false;
  }

  async removeSignFlow(signFlow) {
    if (signFlow) {
      const signSubcase = await signFlow.signSubcase;
      const signMarkingActivity = await signSubcase.signMarkingActivity;
      const piece = await signMarkingActivity.piece;
      const signedPiece = await piece.signedPiece;
      const signedFile = await signedPiece?.file;
      const signPreparationActivity = await signSubcase
        ?.belongsTo('signPreparationActivity')
        .reload();
      const signCompletionActivity = await signSubcase
        ?.belongsTo('signCompletionActivity')
        .reload();
      const signCancellationActivity = await signSubcase
        ?.belongsTo('signCancellationActivity')
        .reload();
      const signApprovalActivities = await signSubcase
        ?.hasMany('signApprovalActivities')
        .reload();
      const signSigningActivities = await signSubcase
        ?.hasMany('signSigningActivities')
        .reload();
      const signRefusalActivities = await signSubcase
        ?.hasMany('signRefusalActivities')
        .reload();

      // delete in reverse order of creation
      await signedFile?.destroyRecord();
      await signedPiece?.destroyRecord();
      await signPreparationActivity?.destroyRecord();
      await signCompletionActivity?.destroyRecord();
      await signCancellationActivity?.destroyRecord();
      await signApprovalActivities?.map(async (activity) => {
        await activity.destroyRecord();
      });
      await signSigningActivities?.map(async (activity) => {
        await activity.destroyRecord();
      });
      await signRefusalActivities?.map(async (activity) => {
        await activity.destroyRecord();
      });
      // destroying signSubcase can throw ember errors. reload fixed that problem.
      await signSubcase?.reload();
      await signSubcase?.destroyRecord();
      await signFlow?.destroyRecord();
      await signMarkingActivity.destroyRecord();
      await piece.belongsTo('signedPiece').reload();
      await piece.belongsTo('signMarkingActivity').reload();
    }
  }

  async hasSignFlow(piece) {
    const signaturesEnabled = !!ENV.APP.ENABLE_SIGNATURES;
    if (signaturesEnabled) {
      if (await piece.signMarkingActivity) {
        return true;
      } else if (await piece.signCompletionActivity) {
        return true;
      } else if (await piece.signedPiece) {
        return true;
      }
    }
    return false;
  }

  async getSigningHubUrl(signFlow, piece) {
    const response = await fetch(
      `/signing-flows/${signFlow.id}/pieces/${piece.id}/signinghub-url?collapse_panels=false`
    );
    if (response.ok && response.status === 200) {
      const result = await response.json();
      return result.url;
    }
  }
}
