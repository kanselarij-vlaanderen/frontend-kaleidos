import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import { getJsonPayloadOrThrow } from 'frontend-kaleidos/utils/json-util';
import fetch from 'fetch';

export default class MonitoringNewsletterController extends Controller {
  @service router;
  @service draftSubmissionService;
  @service store;
  @service toaster;
  @service intl;

  queryParams = [
    {
      page: {
        type: 'number',
      },
    },
    {
      size: {
        type: 'number',
      },
    },
    {
      sort: {
        type: 'string',
      },
    },
  ];

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[1];
  @tracked sort = '-start-date';

  nextPage = () => (this.page += 1);
  prevPage = () => (this.page -= 1);

  getThemisExportStatus = async (themisPublicationActivity) => {
    const meeting = await themisPublicationActivity.meeting;
    const date = themisPublicationActivity.startDate;
    try {
      if (date) {
        const res = await fetch(
          `/data-monitoring/meeting/${meeting.id}/public-export-jobs?startDate=${date.toISOString()}`,
        );
        const result = await getJsonPayloadOrThrow(res);
        if (result) {
          return {
            id: result.data.id,
            uri: result.data.attributes.uri,
            meeting: result.data.attributes.meeting,
            created: result.data.attributes.created,
            status: result.data.attributes.status,
          };
        }
      }
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-with-message', {
          message: `getThemisExportStatus: ${error.message}`,
        }),
        this.intl.t('warning-title'),
      );
    }
  };

  getTtlTaskStatus = async (themisPublicationActivity) => {
    const meeting = await themisPublicationActivity.meeting;
    const date = themisPublicationActivity.startDate;
    try {
      if (date) {
        const res = await fetch(
          `/data-monitoring/meeting/${meeting.id}/tto-to-delta-task?startDate=${date.toISOString()}`,
        );
        const result = await getJsonPayloadOrThrow(res);
        if (result) {
          return {
            id: result.data.id,
            uri: result.data.attributes.uri,
            meeting: result.data.attributes.meeting,
            created: result.data.attributes.created,
            status: result.data.attributes.status,
          };
        }
      }
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-with-message', {
          message: `getTtlTaskStatus: ${error.message}`,
        }),
        this.intl.t('warning-title'),
      );
    }
  };

  getThemisSyncTask = async (themisPublicationActivity) => {
    const meeting = await themisPublicationActivity.meeting;
    const date = themisPublicationActivity.startDate;
    try {
      if (date) {
        const res = await fetch(
          `/data-monitoring/meeting/${meeting.id}/themis-sync-task?startDate=${date.toISOString()}`,
        );
        const result = await getJsonPayloadOrThrow(res);
        if (result) {
          return {
            id: result.data.id,
            uri: result.data.attributes.uri,
            meeting: result.data.attributes.meeting,
            created: result.data.attributes.created,
            status: result.data.attributes.status,
          };
        }
      }
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-with-message', {
          message: `getThemisSyncTask: ${error.message}`,
        }),
        this.intl.t('warning-title'),
      );
    }
  };

  getThemisReleaseTask = async (themisPublicationActivity) => {
    const meeting = await themisPublicationActivity.meeting;
    const date = themisPublicationActivity.startDate;
    try {
      if (date) {
        const res = await fetch(
          `/data-monitoring/meeting/${meeting.id}/themis-release-task?startDate=${date.toISOString()}`,
        );
        const result = await getJsonPayloadOrThrow(res);
        if (result) {
          return {
            id: result.data.id,
            uri: result.data.attributes.uri,
            meeting: result.data.attributes.meeting,
            created: result.data.attributes.created,
            status: result.data.attributes.status,
          };
        }
      }
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-with-message', {
          message: `getThemisReleaseTask: ${error.message}`,
        }),
        this.intl.t('warning-title'),
      );
    }
  };

  getThemisDataset = async (themisPublicationActivity) => {
    const meeting = await themisPublicationActivity.meeting;
    const date = themisPublicationActivity.startDate;
    try {
      if (date) {
        const res = await fetch(
          `/data-monitoring/meeting/${meeting.id}/themis-dataset?startDate=${date.toISOString()}`,
        );
        const result = await getJsonPayloadOrThrow(res);
        if (result) {
          return {
            id: result.data.id,
            uri: result.data.attributes.uri,
            meeting: result.data.attributes.meeting,
            'release-date': result.data.attributes['release-date'],
          };
        }
      }
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-with-message', {
          message: `getThemisDataset: ${error.message}`,
        }),
        this.intl.t('warning-title'),
      );
    }
  };
}
