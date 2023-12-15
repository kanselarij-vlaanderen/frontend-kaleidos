import Service, { inject as service } from '@ember/service';
import { uploadPiecesToSigninghub } from 'frontend-kaleidos/utils/digital-signing';
import { task } from 'ember-concurrency';
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

      // Remove any old signers if they exist
      const signSigningActivities = await signSubcase
        ?.hasMany('signSigningActivities')
        .reload();
      await signSigningActivities?.map(async (activity) => {
        await activity.destroyRecord();
      });
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

      // Remove any old approvers if they exist
      const signApprovalActivities = await signSubcase
        ?.hasMany('signApprovalActivities')
        .reload();
      await signApprovalActivities?.map(async (activity) => {
        await activity.destroyRecord();
      });
      // Attach approvers
      await Promise.all(
        approvers.map((approver) => {
          const approverLowerCase = approver.toLowerCase();
          const record = this.store.createRecord('sign-approval-activity', {
            approver: approverLowerCase,
            signSubcase,
          });
          return record.save();
        })
      );

      const notifiedLowerCase = notified.map(notifyEmail => notifyEmail.toLowerCase())
      // Attach notified
      signSubcase.notified = notifiedLowerCase;
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
    if (response.ok) {
      const job = await response.json();
      await this.pollPrepareSignFlow(job);
    } else {
      let stringifiedJson;
      try {
        const json = await response?.json();
        stringifiedJson = JSON.stringify(json);
      } catch (error) {
        // cannot stringify could mean digital-signing is down
      }
      throw new Error(stringifiedJson ?? response.statusText);
    }
  }

  async pollPrepareSignFlow(job) {
    let jobResult = await this.getJob.perform(job);
    if (jobResult) {
      // Use a loop here instead of a setTimeout like we do elsewhere because
      // we need to throw an error here if the job fails. In a setTimeout that
      // doesn't work.
      while ([
        constants.SIGN_FLOW_JOB_STATUSSES.BUSY,
        constants.SIGN_FLOW_JOB_STATUSSES.SCHEDULED
      ].includes(jobResult.status)) {
        await new Promise(r => setTimeout(r, 2000));
        jobResult = await this.getJob.perform(job);
      }
      if (jobResult.status === constants.SIGN_FLOW_JOB_STATUSSES.SUCCESS) {
        // We're done polling :)
      } else if (jobResult.status === constants.SIGN_FLOW_JOB_STATUSSES.FAILED) {
        throw new Error(jobResult.error_message);
      }
    }
  };

  getJob = task(async (job) => {
    let response;
    try {
      response = await fetch(`/signing-flows/job/${job.id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          `Backend response contained an error (status: ${
            response.status
          }): ${JSON.stringify(data)}`
        );
      }
      return data;
    } catch (error) {
      // Errors returned from services *should* still
      // be valid JSON(:API), but we could encounter
      // non-JSON if e.g. a service is down. If so,
      // throw a nice error that only contains the
      // response status.
      if (error instanceof SyntaxError) {
        throw new Error(
          `Backend response contained an error (status: ${response.status})`
        );
      } else {
        throw error;
      }
    }
  });

  /**
   * Marks a piece for signature by creating a sign flow, sign subcase and sign
   * marking activity. The sign subcase and sign flow are returned.
   *
   * Note: The return values are currently unused by any caller.
   *
   * @param {Piece} piece The piece that will be marked for signing
   * @param {DecisionActivity} decisionActivity The decision activity
   *   related to the piece being marked for signing, this should only be passed
   * for regular pieces and reports, not minutes
   * @param {Meeting} meeting The meeting related to the piece being
   *   marked for signing, this should only be be passed for minutes and reports
   */
  async markDocumentForSignature(piece, decisionActivity, meeting) {
    const existingSignMarking = await piece.belongsTo('signMarkingActivity').reload();
    if (existingSignMarking) {
      // someone else may have made a signflow, returning that one instead
      const signSubcase = await existingSignMarking.signSubcase;
      const signFlow = await signSubcase.signFlow;
      return {
        signFlow,
        signSubcase,
      };
    }
    const subcase = await decisionActivity?.subcase;
    const decisionmakingFlow = await subcase?.decisionmakingFlow;
    const _case = await decisionmakingFlow?.case;
    const now = new Date();
    const status = await this.store.findRecordByUri('concept', MARKED);

    // TODO: Shouldn't the short & long title be coming from the agendaitem. Also when would show or edit this data?
    const signFlow = this.store.createRecord('sign-flow', {
      openingDate: now,
      shortTitle: _case?.shortTitle,
      longTitle: _case?.title,
      case: _case,
      decisionActivity,
      meeting,
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


  /**
   * Marks a new version of a marked piece for signature by recreating the sign flow, sign subcase
   * and sign marking activity.
   * @param {Piece} oldPiece The old piece that should no longer be marked for signing
   * @param {Piece} newPiece The new piece that will be marked for signing
   * @param {DecisionActivity} decisionActivity The decision activity
   *   related to the piece being marked for signing, this should only be passed
   * for regular pieces and reports, not minutes
   * @param {Meeting} meeting The meeting related to the piece being
   *   marked for signing, this should only be be passed for minutes and reports
   */
  async markNewPieceForSignature(oldPiece, newPiece, decisionActivity, meeting) {
    if (!oldPiece) {
      oldPiece = await newPiece.previousPiece;
    }
    const hasMarkedSignFlow = await this.hasMarkedSignFlow(oldPiece);
    if (hasMarkedSignFlow) {
      await this.removeSignFlowForPiece(oldPiece);
      await this.markDocumentForSignature(newPiece, decisionActivity, meeting);
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
      const subcase = await submissionActivity?.subcase;
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

  async removeSignFlow(signFlow, keepMarkingActivity) {
    if (signFlow) {
      const signSubcase = await signFlow.signSubcase;
      const signMarkingActivity = await signSubcase.signMarkingActivity;
      const piece = await signMarkingActivity.piece;
      if (!keepMarkingActivity) {
        await fetch(`/signing-flows/${signFlow.id}`, {
          method: 'DELETE'
        });
      } else {
        await fetch(`/signing-flows/reset-signflow/${signFlow.id}`, {
          method: 'POST'
        });
      }
      await piece.belongsTo('signedPiece').reload();
      await piece.belongsTo('signMarkingActivity').reload();
    }
  }

  async removeSignFlowForPiece(piece, ignoreStatus=false) {
    const signMarkingActivity = await piece.belongsTo('signMarkingActivity').reload();;
    const signSubcase = await signMarkingActivity?.signSubcase;
    const signFlow = await signSubcase?.signFlow;
    const status = await signFlow?.status;
    if (signFlow && (ignoreStatus || status.uri === MARKED)) {
      await this.removeSignFlow(signFlow);
    }
  }

  async replaceDecisionActivity(piece, decisionActivity) {
    const signMarkingActivity = await piece.belongsTo('signMarkingActivity').reload();;
    const signSubcase = await signMarkingActivity?.signSubcase;
    const signFlow = await signSubcase?.signFlow;
    const status = await signFlow?.status;
    if (signFlow && status.uri === MARKED) {
      signFlow.decisionActivity = decisionActivity;
      await signFlow.save();
    }
  }

  async hasSignFlow(piece) {
    if (await piece.signMarkingActivity) {
      return true;
    } else if (await piece.signCompletionActivity) {
      return true;
    } else if (await piece.signedPiece) {
      return true;
    }
  }

  async hasMarkedSignFlow(piece) {
    const signMarkingActivity = await piece.belongsTo('signMarkingActivity').reload();
    const signSubcase = await signMarkingActivity?.signSubcase;
    const signFlow = await signSubcase?.signFlow;
    const status = await signFlow?.belongsTo('status').reload();
    return status?.uri === MARKED;
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

  async markReportsForSignature(reports) {
    if (!reports?.length) {
      return this.toaster.warning(this.intl.t('no-decision-reports-to-mark-for-signing'));
    }
    const loadingToast = this.toaster.loading(
      this.intl.t('decision-reports-are-being-marked-for-signing', {aantal: reports.length}),
      null,
      {
        timeOut: 10 * 60 * 1000,
      }
    );
    const resp = await fetch(`/signing-flows/mark-pieces-for-signing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: reports.map((report) => ({ type: 'reports', id: report.id })),
      }),
    });
    this.toaster.close(loadingToast);
    if (!resp.ok) {
      // TODO error from service? did all fail? maybe only 1 failed?
      this.toaster.warning(this.intl.t('error-while-marking-decision-reports-for-signing'));
    } else {
      this.toaster.success(
        this.intl.t('decision-reports-are-marked-for-signing', {aantal: reports.length}),
      );
    }
  }

}
