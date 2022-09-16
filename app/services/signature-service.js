import Service, { inject as service } from '@ember/service';

export default class SignatureService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service currentSession;

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
    }
  }

  async unmarkDocumentForSignature(piece) {
    const signMarkingActivity = await piece.signMarkingActivity;
    const signPreparationActivity = await signMarkingActivity.signPreparationActivity;

    if (signPreparationActivity) {
      this.toaster.error(this.intl.t('unmarking-not-possible'));
      return;
    }
    const signSubcase = await signMarkingActivity.signSubcase;
    const signFlow = await signSubcase.signFlow;

    await signFlow.destroyRecord();
    await signSubcase.destroyRecord();
    await signMarkingActivity.destroyRecord();
  }
}
