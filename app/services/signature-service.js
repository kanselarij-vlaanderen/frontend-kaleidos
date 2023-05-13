import Service, { inject as service } from '@ember/service';
import { uploadPiecesToSigninghub } from 'frontend-kaleidos/utils/digital-signing';

export default class SignatureService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service currentSession;

  async createSignFlow(
    piece,
    decisionActivity,
    signers,
    approvers,
    notified,
  ) {
    // Create sign flow, sign subcase and marking activity
    const {
      signFlow,
      signSubcase,
    } = await this.markDocumentForSignature(piece, decisionActivity);


    // Attach signers
    await Promise.all(
      signers.map((mandatee) => {
        const record = this.store.createRecord(
          'sign-signing-activity',
          {
            signSubcase,
            mandatee,
          }
        );
        return record.save();
      })
    );

    // Attach approvers
    await Promise.all(
      approvers.map((approver) => {
        const record = this.store.createRecord(
          'sign-approval-activity',
          {
            approver,
            signSubcase,
          }
        );
        return record.save();
      })
    );

    // Attach notified
    signSubcase.notified = notified;
    await signSubcase.save();

    // Prepare sign flow: create preparation activity and send to SH
    await uploadPiecesToSigninghub(signFlow, [piece]);
  }

  async markDocumentForSignature(piece, decisionActivity) {
    const subcase = await decisionActivity?.subcase;
    if (subcase) {
      const decisionmakingFlow = await subcase.decisionmakingFlow;
      const _case = await decisionmakingFlow.case;
      const creator = await this.currentSession.user;
      const now = new Date();

      // TODO: Shouldn't the short & long title be coming from the agendaitem. Also when would show or edit this data?
      const signFlow = this.store.createRecord('sign-flow', {
        openingDate: now,
        shortTitle: _case.shortTitle,
        longTitle: _case.title,
        case: _case,
        decisionActivity,
        creator: creator,
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
      }
    }
  }
}
