import Component from '@glimmer/component';
import { service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class MonitoringStatusPill extends Component {
  @service intl;

  get skin() {
    const scheduled = 'default';
    const busy = 'warning';
    const success = 'success';
    const failed = 'error';
    switch (this.args.status) {
      // themis-export
      case CONSTANTS.THEMIS_EXPORT_JOB_STATUSES.SCHEDULED:
        return scheduled;
      case CONSTANTS.THEMIS_EXPORT_JOB_STATUSES.BUSY:
        return busy;
      case CONSTANTS.THEMIS_EXPORT_JOB_STATUSES.SUCCESS:
        return success;
      case CONSTANTS.THEMIS_EXPORT_JOB_STATUSES.FAILED:
        return failed;
      // themis ttl-to-delta
      case CONSTANTS.TTL_TO_DELTA_TASK_STATUSES.SCHEDULED:
        return scheduled;
      case CONSTANTS.TTL_TO_DELTA_TASK_STATUSES.BUSY:
        return busy;
      case CONSTANTS.TTL_TO_DELTA_TASK_STATUSES.SUCCESS:
        return success;
      case CONSTANTS.TTL_TO_DELTA_TASK_STATUSES.FAILED:
        return failed;
      // themis sync-task
      case CONSTANTS.THEMIS_SYNC_TASK_STATUSES.SCHEDULED:
        return scheduled;
      case CONSTANTS.THEMIS_SYNC_TASK_STATUSES.BUSY:
        return busy;
      case CONSTANTS.THEMIS_SYNC_TASK_STATUSES.SUCCESS:
        return success;
      case CONSTANTS.THEMIS_SYNC_TASK_STATUSES.FAILED:
        return failed;
      // themis release-task
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.NOT_STARTED:
        return scheduled;
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.PREPARING_RELEASE:
        return busy;
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.READY_FOR_RELEASE:
        return busy;
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.RELEASING:
        return busy;
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.SUCCESS:
        return success;
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.FAILED:
        return failed;
      // yggdrasil distributor job
      case CONSTANTS.DISTRIBUTOR_JOB_STATUSES.SCHEDULED:
        return scheduled;
      case CONSTANTS.DISTRIBUTOR_JOB_STATUSES.BUSY:
        return busy;
      case CONSTANTS.DISTRIBUTOR_JOB_STATUSES.SUCCESS:
        return success;
      case CONSTANTS.DISTRIBUTOR_JOB_STATUSES.FAILED:
        return failed;
      default:
        return 'default';
    }
  }

  get label() {
    const scheduled = 'Scheduled';
    const busy = 'In progress';
    const success = 'success';
    const failed = 'Failed';
    switch (this.args.status) {
      // themis-export
      case CONSTANTS.THEMIS_EXPORT_JOB_STATUSES.SCHEDULED:
        return scheduled;
      case CONSTANTS.THEMIS_EXPORT_JOB_STATUSES.BUSY:
        return busy;
      case CONSTANTS.THEMIS_EXPORT_JOB_STATUSES.SUCCESS:
        return success;
      case CONSTANTS.THEMIS_EXPORT_JOB_STATUSES.FAILED:
        return failed;
      // ttl-to-delta
      case CONSTANTS.TTL_TO_DELTA_TASK_STATUSES.SCHEDULED:
        return scheduled;
      case CONSTANTS.TTL_TO_DELTA_TASK_STATUSES.BUSY:
        return busy;
      case CONSTANTS.TTL_TO_DELTA_TASK_STATUSES.SUCCESS:
        return success;
      case CONSTANTS.TTL_TO_DELTA_TASK_STATUSES.FAILED:
        return failed;
      // themis sync-task
      case CONSTANTS.THEMIS_SYNC_TASK_STATUSES.SCHEDULED:
        return scheduled;
      case CONSTANTS.THEMIS_SYNC_TASK_STATUSES.BUSY:
        return busy;
      case CONSTANTS.THEMIS_SYNC_TASK_STATUSES.SUCCESS:
        return success;
      case CONSTANTS.THEMIS_SYNC_TASK_STATUSES.FAILED:
        return failed;
      // themis release-task
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.NOT_STARTED:
        return scheduled;
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.PREPARING_RELEASE:
        return busy;
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.READY_FOR_RELEASE:
        return busy;
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.RELEASING:
        return busy;
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.SUCCESS:
        return success;
      case CONSTANTS.THEMIS_RELEASE_TASK_STATUSES.FAILED:
        return failed;
      case CONSTANTS.DISTRIBUTOR_JOB_STATUSES.SCHEDULED:
        return scheduled;
      case CONSTANTS.DISTRIBUTOR_JOB_STATUSES.BUSY:
        return busy;
      case CONSTANTS.DISTRIBUTOR_JOB_STATUSES.SUCCESS:
        return success;
      case CONSTANTS.DISTRIBUTOR_JOB_STATUSES.FAILED:
        return failed;
      default:
        return 'Status Unknown';
    }
  }
}
