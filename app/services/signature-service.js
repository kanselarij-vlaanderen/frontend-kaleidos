import Service, { inject as service } from '@ember/service';
import syncWrapper from 'frontend-kaleidos/utils/sync-wrapper';

/**
 * Goal: offer common computed properties
 * To allow this, all relationships are resolved
 */
class SignFlowContext {
  static async create(signatureService, signFlow) {
    const syncSignFlow = await syncWrapper(signFlow, {
      signSubcase: {
        signMarkingActivity: {},
        signPreparationActivity: {},
        signSigningActivities: [{}],
      },
    });
    return Object.assign(new SignFlowContext(), {
      signatureService: signatureService,
      signFlow: signFlow,
      _syncSignFlow: syncSignFlow,
    });
  }

  get canBeOffered() {
    /** @todo?: check whether signers and signature fields are assigned */
    const canBeOffered =
      this.signatureService.canUserPrepare && this.status.isMarked;
    return canBeOffered;
  }

  get status() {
    const statusString = SignFlowContext._getStatus(this._syncSignFlow);
    return new SignFlowStatus(statusString);
  }

  /**
   * @description determine status of a SignFlow (=multiple signatures/!= signature of a mandatee)
   * TODO: other statusses
   * @private
   */
  static _getStatus(syncSignFlow) {
    let status;
    const signSubcase = syncSignFlow.signSubcase;
    const signingActivities = signSubcase.signSigningActivities;
    if (signingActivities.length) {
      if (signingActivities[0].startDate) {
        status = 'signing';
      } else {
        status = 'marking';
      }
    } else {
      status = 'marking';
    }
    return status;
  }
}

/**
 * @description wrapper class to avoid use of @param type string
 * @todo Handle other statusses
 */
class SignFlowStatus {
  constructor(type) {
    this._type = type;
  }

  get isMarked() {
    return this._type === 'marking';
  }

  get isSigning() {
    return this._type === 'signing';
  }
}

export default class SignatureService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service currentSession;

  get canUserPrepare() {
    // TODO: allow this to kabinet role
    // return this.currentSession.isAdmin || this.currentSession.isKabinet;
    return this.currentSession.isAdmin || this.currentSession.isKanselarij;
  }

  get canUserSign() {
    return this.currentSession.isMinister;
  }

  /** @async */
  createSignFlowContext(signFlow) {
    return SignFlowContext.create(this, signFlow);
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
    const signPreparationActivity =
      await signMarkingActivity.signPreparationActivity;

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
