import Service, { inject as service } from '@ember/service';
import syncWrapper from 'frontend-kaleidos/utils/sync-wrapper';

class SignFlowWrapper {
  constructor(signatureService, signFlow) {
    this.signatureService = signatureService;
    this.signFlow = signFlow;
    this.status = new SignFlowStatus(this._getStatus.bind(this));
  }

  get canOffer() {
    /** @todo?: check whether signers and signature fields are assigned */
    const canOffer = this.signatureService.canUserPrepare && this.status.isPreparing;
    return canOffer;
  }

 /**
 * TODO: other statusses
 * @private
 */
  _getStatus() {
    let status;
    const signSubcase = this.signFlow.signSubcase;
    const signingActivities = signSubcase.signSigningActivities;
    if (signingActivities.length) {
      if (signingActivities[0].startDate) {
        status = 'signing'
      } else {
        status = 'preparation';
      }
    } else if (signSubcase.signPreparationActivity) {
      status = 'preparation';
    } else {
      status = 'marking';
    }
    return status;
  }
}

/**
 * @todo Handle other status
 */
class SignFlowStatus {
  constructor(type) {
    this._type = type;
  }

  get isMarked() {
    return this._type() === 'marking';
  }

  get isPreparing() {
    return this._type() === 'preparation';
  }

  get isSigning() {
    return this._type() === 'signing';
  }
}

export default class SignatureService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service currentSession;

  get canUserPrepare() {
    return this.currentSession.isAdmin || this.currentSession.isKabinet;
  }

  get canUserSign() {
    return this.currentSession.isMinister;
  }

  async createSignFlowWrapper(signFlow) {
    const wrappedSignFlow = await syncWrapper(signFlow, {
      signSubcase: {
        signMarkingActivity: {},
        signPreparationActivity: {},
        signSigningActivities: [{}],
      }
    })
    return new SignFlowWrapper(this, wrappedSignFlow)
  }

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
