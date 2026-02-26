import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { singularize } from '@ember-data/request-utils/string'
import fetch from 'fetch';
import { isEnabledCabinetSubmissions } from 'frontend-kaleidos/utils/feature-flag';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import generateReportName from 'frontend-kaleidos/utils/generate-report-name';
import { getJsonPayloadOrThrow } from 'frontend-kaleidos/utils/json-util';
import { deleteDocumentContainer } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class AgendaService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service currentSession;
  @service newsletterService;
  @service signatureService;
  @service decisionReportGeneration;

  @tracked addedPieces = null;
  @tracked addedAgendaitems = null;

  /* API: agenda-sort-service */

  async agendaWithChanges(currentAgendaID, agendaToCompareID) {
    const endpoint = new URL(
      '/agenda-comparison/agenda-with-changes',
      window.location.origin
    );
    const queryParams = new URLSearchParams(
      Object.entries({
        agendaToCompare: agendaToCompareID,
        selectedAgenda: currentAgendaID,
      })
    );
    endpoint.search = queryParams.toString();
    const response = await fetch(endpoint);
    if (response.ok) {
      const result = await getJsonPayloadOrThrow(response);
      this.addedPieces = result.addedDocuments;
      this.addedAgendaitems = result.addedAgendaitems;
    }
  }

  async newAgendaItems(currentAgendaId, comparedAgendaId) {
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-items`;
    const response = await fetch(url);
    const payload = await getJsonPayloadOrThrow(response);
    const itemsFromStore = [];
    for (const item of payload.data) {
      let itemFromStore = this.store.peekRecord(
        singularize(item.type),
        item.id
      );
      if (!itemFromStore) {
        itemFromStore = await this.store.queryRecord(
          singularize(item.type),
          item.id
        );
      }
      itemsFromStore.push(itemFromStore);
    }
    return itemsFromStore;
  }

  async modifiedAgendaItems(currentAgendaId, comparedAgendaId, scopeFields) {
    // scopefields specify which fields to base upon for determining if an item was modified
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-items?changeset=modified&scope=${scopeFields.join(
      ','
    )}`;
    const response = await fetch(url);
    const payload = await getJsonPayloadOrThrow(response);
    const itemsFromStore = [];
    for (const item of payload.data) {
      let itemFromStore = this.store.peekRecord(
        singularize(item.type),
        item.id
      );
      if (!itemFromStore) {
        itemFromStore = await this.store.queryRecord(
          singularize(item.type),
          item.id
        );
      }
      itemsFromStore.push(itemFromStore);
    }
    return itemsFromStore;
  }

  async changedPieces(currentAgendaId, comparedAgendaId, agendaItemId) {
    if (!this.currentSession.may('view-document-version-info')) {
      return [];
    }
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-item/${agendaItemId}/pieces`;
    const response = await fetch(url);
    const payload = await getJsonPayloadOrThrow(response);
    const piecesFromStore = [];
    for (const piece of payload.data) {
      let pieceFromStore = this.store.peekRecord(
        singularize(piece.type),
        piece.id
      );
      if (!pieceFromStore) {
        pieceFromStore = await this.store.queryRecord(
          singularize(piece.type),
          piece.id
        );
      }
      piecesFromStore.push(pieceFromStore);
    }
    return piecesFromStore;
  }

  createInternalReview = async(subcase, submissions, privateComment) => {
    const subcaseSubmissions = await subcase?.submissions;
    const submissionsToSet = submissions || subcaseSubmissions;
    const internalReview = await this.store.createRecord('submission-internal-review', {
      created: new Date(),
      privateComment: privateComment, // default to the CONSTANTS? diff between nota and mededeling somewhere?
      submissions: submissionsToSet,
      subcase: subcase,
    });
    await internalReview.save();
  };

  /* API: agenda-submission-service */

  async reorderAgenda(agenda) {
    const url = `/agendas/${agenda.id}/reorder`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' },
    });
    if (!response.ok) {
      await getJsonPayloadOrThrow(response);
    }
    await agenda.hasMany('agendaitems').reload();
  }

  /**
   * @argument meeting
   * @argument subcase
   * @argument formallyOk: optional, defaults to "not yet ok"
   * @argument privateComment: optional
   */
  async putSubmissionOnAgenda(
    meeting,
    subcase,
    formallyStatusUri = CONSTANTS.FORMALLY_OK_STATUSES.NOT_YET_FORMALLY_OK,
    privateComment = null,
    submission = null
  ) {  
    const internalReview = await subcase.internalReview;
    if (!internalReview?.id) {
      await this.createInternalReview(subcase, null, privateComment);
    }
    const url = `/meetings/${meeting.id}/submit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' },
      body: JSON.stringify({
        subcase: subcase.uri,
        formallyOkStatus: formallyStatusUri,
        submission: submission?.uri,
      })
    });
    const json = await getJsonPayloadOrThrow(response);
    const agendaitem = await this.store.findRecord('agendaitem', json.data.id);
    await subcase.hasMany('agendaActivities').reload();
    await subcase.hasMany('submissionActivities').reload();
    if (json.data.didReorder) {
      const meeting = await this.store.queryOne('meeting', {
        'filter[agendas][agendaitems][:id:]': json.data.id,
      });
      if (meeting?.id && agendaitem?.number) {
        const reportsToRegenerate = [];
        const reports = await this.store.queryAll('report', {
          'filter[:has-no:next-piece]': true,
          'filter[:has:piece-parts]': true,
          'filter[decision-activity][treatment][agendaitems][agenda][created-for][:id:]': meeting.id,
          'filter[decision-activity][treatment][agendaitems][type][:uri:]': CONSTANTS.AGENDA_ITEM_TYPES.NOTA, // announcements are not reordered
          // before we filtered on [:gt:number]': agendaitem.number , but there is a scenario where the service reorders agendaitems with numbers that are lower.
          // this scenario involves manual changes made by users to the numbers. The service will overwrite those changes while inserting the new agendaitem
          // we need to regenerate the reports in those scenarios as well if the reports exist.
        });
        if (reports?.length) {
          await Promise.all(reports.map(async (report) => {
            const agendaitem = await this.store.queryOne('agendaitem', {
              'filter[:has-no:next-version]': true,
              'filter[treatment][decision-activity][report][:id:]': report.id,
            });
            const documentContainer = await report.documentContainer;
            const pieces = await documentContainer.pieces;
            const newName = await generateReportName(agendaitem, meeting, pieces.length);
            if (report.name !== newName) {
              reportsToRegenerate.push(report);
              report.name = newName;
              await report.belongsTo('file').reload();
              await report.save();
            }
          }));
          await this.decisionReportGeneration.generateReplacementReports.perform(reportsToRegenerate);
        }
      }
    }
    if (json.data.didRestoreFromSubmission) {
      // There may be a decision now with stale name or content.
      const report = await this.store.queryOne('report', {
        'filter[:has-no:next-piece]': true,
        'filter[:has:piece-parts]': true,
        'filter[decision-activity][treatment][agendaitems][:id:]': agendaitem.id,
      });
      if (report) {
        const documentContainer = await report.documentContainer;
        const pieces = await documentContainer.pieces;
        const newName = await generateReportName(agendaitem, meeting, pieces.length);
        if (report.name !== newName) {
          report.name = newName;
          await report.belongsTo('file').reload();
          await report.save();
        }
        await this.decisionReportGeneration.generateReplacementReport.perform(report);

        // since we have a "restored" report, we also need a decision result.
        // approved is the only logical one (nota and not postponed/retracted yet)
        const decisionActivity = await this.store.queryOne('decision-activity', {
          'filter[treatment][agendaitems][:id:]': agendaitem.id,
        });
        const decisionResultCode = await this.store.findRecordByUri(
          'concept',
          CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
        );
        decisionActivity.decisionResultCode = decisionResultCode;
        await decisionActivity.save();
      }
    }
    return agendaitem;
  }

  /**
   * @argument meeting
   * @argument submission
   */
  async putDraftSubmissionOnAgenda(meeting, submission) {
    if (!isEnabledCabinetSubmissions()) {
      return;
    }
    const url = `/meetings/${meeting.id}/submit-submission`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' },
      body: JSON.stringify({
        meeting: meeting.uri,
        submission: submission.uri,
      })
    });
    await submission.belongsTo('meeting').reload();
    if (!response.ok) {
      await getJsonPayloadOrThrow(response);
    }
  }

  async getOpenMeetings() {
    if (!isEnabledCabinetSubmissions()) {
      return;
    }
    const url = `/meetings/open`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/vnd.api+json' },
    });
    const json = await getJsonPayloadOrThrow(response);
    return json;
  }

  async getPreliminaryDecisionResultCode(agendaitem) {
    if (!agendaitem?.id) {
      return;
    }
    const url = `/agendaitem/${agendaitem.id}/preliminary-decision-result-code`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/vnd.api+json' },
    });
    const json = await getJsonPayloadOrThrow(response);
    return json.data;
  }

  async getAgendaAndMeetingForSubmission(submission) {
    const url = `/submissions/${submission.id}/for-meeting`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/vnd.api+json' },
    });
    try {
      const json = await getJsonPayloadOrThrow(response);
      const agenda = {
        id: json.data.attributes.agendaId,
        uri: json.data.attributes.agenda,
        serialnumber: json.data.attributes.serialnumber,
        createdFor: {
          id: json.data.id,
          uri: json.data.attributes.uri,
          plannedStart: new Date(json.data.attributes.plannedStart),
          kind: {
            uri: json.data.attributes.kind,
            label: json.data.attributes.type,
          }
        },
      };
      return agenda;
    } catch (error) {
       this.toaster.error(
        this.intl.t('error-with-message', { message: error?.message }),
        this.intl.t('warning-title'),
      );
    }
  }

  /**
   * @argument agendaitem
   * @argument submission
   */
  async keepDraftDecisionAndNewsItem(agendaitem, submission) {
    const url = `/submissions/${submission.id}/keep-draft-decision-and-news-item`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' },
      body: JSON.stringify({
        agendaitem: agendaitem.uri,
      })
    });
    if (!response.ok) {
      await getJsonPayloadOrThrow(response);
    }
  }

  /* No API */

  async setAgendaitemsGroupname(agendaitems) {
    let previousAgendaitemGroupName;
    return Promise.all(
      agendaitems.map(async (agendaitem) => {
        let currentAgendaitemGroupName;
        const mandatees = await agendaitem.mandatees;
        const sortedMandatees = mandatees
          .slice()
          .sort((m1, m2) => m1.priority - m2.priority);
        if (agendaitem.isApproval) {
          agendaitem.set('groupName', null);
          agendaitem.set('ownGroupName', null);
          return;
        }
        if (sortedMandatees.length === 0) {
          agendaitem.set('groupName', this.intl.t('no-mandatee-assigned'));
          currentAgendaitemGroupName = this.intl.t('no-mandatee-assigned');
        } else {
          currentAgendaitemGroupName = sortedMandatees
            .map((mandatee) => mandatee.title)
            .join('<br/>');
        }

        if (currentAgendaitemGroupName !== previousAgendaitemGroupName) {
          previousAgendaitemGroupName = currentAgendaitemGroupName;
          agendaitem.set('groupName', currentAgendaitemGroupName);
        } else {
          agendaitem.set('groupName', null);
        }
        agendaitem.set('ownGroupName', currentAgendaitemGroupName);
      })
    );
  }

  async deleteAgendaitem(agendaitem, keepDecisionAndNewsItem = false) {
    const agendaitemToDelete = await this.store.findRecord(
      'agendaitem',
      agendaitem.get('id'),
      {
        reload: true,
      }
    );
    agendaitemToDelete.set('aboutToDelete', true);
    const agendaActivity = await agendaitemToDelete.agendaActivity;
    const treatment = await agendaitemToDelete.treatment;

    if (agendaActivity) {
      const subcase = await agendaActivity.subcase;
      await agendaActivity.hasMany('agendaitems').reload();
      const agendaitemsFromActivity = await agendaActivity.agendaitems;
      if (treatment) {
        const decisionActivity = await treatment.decisionActivity;
        const newsItem = await treatment.newsItem;
        if (newsItem && !keepDecisionAndNewsItem) {
          await newsItem.destroyRecord();
        }
        if (decisionActivity) {
          const report = await decisionActivity.belongsTo('report').reload();
          await decisionActivity.destroyRecord();
          if (report && !keepDecisionAndNewsItem) {
            const documentContainer = await report.documentContainer;
            await deleteDocumentContainer(documentContainer);
          }
        }
        await treatment.destroyRecord();
      }
      await Promise.all(
        agendaitemsFromActivity.map(async (agendaitem) => {
          const agenda = await agendaitem.agenda;
          await agendaitem.destroyRecord();
          await agenda.hasMany('agendaitems').reload();
        })
      );
      await agendaActivity.destroyRecord();
      await subcase.hasMany('agendaActivities').reload();
      await subcase.hasMany('decisionActivities').reload();
    } else {
      await agendaitemToDelete.destroyRecord();
    }
  }

  async deleteAgendaitemFromMeeting(agendaitem) {
    if (this.currentSession.may('remove-approved-agendaitems')) {
      await this.deleteAgendaitem(agendaitem);
    } else {
      this.toaster.error(
        this.intl.t('action-not-allowed'),
        this.intl.t('warning-title')
      );
    }
  }
}
