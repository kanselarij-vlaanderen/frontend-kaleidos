import Service, { inject as service } from '@ember/service';

export default class SignatureService extends Service {
  @service store;
  @service currentSession;

  async markDocumentForSignature(piece, agendaItemTreatment) {
    const subcase = await agendaItemTreatment?.subcase;
    if (subcase) {
      const caze = await subcase.case;
      const creator = await this.currentSession.user;
      const now = new Date();

      // TODO: Shouldn't the short & long title be coming from the agendaitem. Also when would show or edit this data?
      const signFlow = this.store.createRecord('sign-flow', {
        openingDate: now,
        shortTitle: caze.shortTitle,
        longTitle: caze.title,
        case: caze,
        decisionActivity: agendaItemTreatment,
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
}
