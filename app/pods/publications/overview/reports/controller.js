import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import moment from 'moment';
import { task } from 'ember-concurrency';

class BaseRow {
  /**
   * @abstract
   * @member {String} key
   */

  /**
   * @abstract
   * @method getReportQueryParams
   * @returns {{ [key: string]: any }}
   */

  store;
  intl;
  currentSession;

  get titleKey() {
    return `publication-reports--type--${this.key}`;
  }

  @task
  *triggerGenerateReport(params) {
    const now = new Date();

    const reportNameDatePrefix = moment(now).format('YYYYMMDDhhmmss');
    const reportNameType = dasherize(this.intl.t(this.titleKey));
    const reportName = `${reportNameDatePrefix}-${reportNameType}`;

    const query = this.getReportQueryParams(params);

    const user = yield this.currentSession.user;

    const job = this.store.createRecord('publication-metrics-export-job', {
      created: now,
      timeStarted: now,
      generatedBy: user,
      config: {
        name: reportName,
        query: query,
      },
    });
    yield job.save();
  }
}

class GovernmentDomainRow extends BaseRow {
  key = 'government-domain';

  getReportQueryParams() {
    return {
      group: this.key,
    };
  }
}

class RegulationTypeRow extends BaseRow {
  key = 'regulation-type';

  getReportQueryParams() {
    return {
      group: this.key,
    };
  }
}

// TODO: will be split up in "van BVR per minister" and "van decreet per minister"
class MandateeRow extends BaseRow {
  key = 'mandatee';

  getReportQueryParams() {
    return {
      group: this.key,
    };
  }
}

export const ReportTypeRows = [
  GovernmentDomainRow,
  RegulationTypeRow,
  MandateeRow,
];

export default class PublicationsOverviewReportsController extends Controller {
  @service store;
}
