import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DecisionReportGeneration extends Service {
  @service toaster;
  @service router;
  @service store;
  @service intl;

  generateReportBundle = task(async (meeting) => {
    const generatingBundleToast = this.toaster.loading(
      this.intl.t(
        'decision-report-bundle-generation--toast-generating--message'
      ),
      this.intl.t('decision-report-bundle-generation--toast-generating--title'),
      {
        timeOut: 10 * 60 * 1000,
      }
    );
    try {
      const job = await this._generateReportBundle.perform(meeting);
      this.pollReportBundle.perform(job, generatingBundleToast);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-while-generating-report-bundle', {
          error: error.message,
        })
      );
    }
  });

  pollReportBundle = task(async (job, generatingBundleToast) => {
    const jobResult = await this.getJob.perform(
      job,
      'generate-decision-report'
    );
    if (jobResult) {
      if (
        jobResult.status === CONSTANTS.DECISION_REPORT_JOB_STATUSSES.SUCCESS
      ) {
        this.toaster.close(generatingBundleToast);
        this.toaster.success(
          this.intl.t(
            'decision-report-bundle-generation--toast-generating-complete--message'
          ),
          this.intl.t(
            'decision-report-bundle-generation--toast-generating-complete--title'
          ),
          {
            closable: true,
            timeOut: 10 * 60 * 1000,
          }
        );
        if (this.router.currentRouteName === 'agenda.documents') {
          this.router.refresh('agenda');
        }
      } else if (
        jobResult.status === CONSTANTS.DECISION_REPORT_JOB_STATUSSES.FAILURE
      ) {
        this.toaster.close(generatingBundleToast);
        this.toaster.error(
          this.intl.t('error-while-generating-report-bundle-no-reason')
        );
      } else {
        setTimeout(() => {
          this.pollReportBundle.perform(job, generatingBundleToast);
        }, 2000);
      }
    }
  });

  generateReplacementReports = task(async (reports) => {
    let { alterableReports, unalterableReports } = await this.getAlterableReports(reports);
    if (alterableReports.length > 0) {
      const generatingPDFsToast = this.toaster.loading(
        this.intl.t('decision-report-generation--toast-generating--message', {
          total: alterableReports.length,
        }),
        this.intl.t('decision-report-generation--toast-generating--title'),
        {
          timeOut: 10 * 60 * 1000,
        }
      );
      try {
        const job = await this._generateMultiplePdfs.perform(
          alterableReports,
          'generate-decision-report'
        );
        this.pollReplacementReports.perform(job, alterableReports, generatingPDFsToast);
      } catch (error) {
        this.toaster.error(
          this.intl.t('error-while-generating-report-pdfs', {
            error: error.message,
          })
        );
      }
    }
    if (unalterableReports.length > 0) {
      this.toaster.error(
        this.intl.t('number-of-reports-cannot-be-altered', {
          number: unalterableReports.length
        })
      );
    }
  });

  pollReplacementReports = task(async (job, reports, generatingPDFsToast) => {
    const jobResult = await this.getJob.perform(
      job,
      'generate-decision-report'
    );
    if (jobResult) {
      if (
        jobResult.status === CONSTANTS.DECISION_REPORT_JOB_STATUSSES.SUCCESS
      ) {
        await this.reloadFiles(reports);
        this.toaster.close(generatingPDFsToast);
        this.toaster.success(
          this.intl.t(
            'decision-report-generation--toast-generating-complete--message',
            {
              total: reports.length,
            }
          ),
          this.intl.t(
            'decision-report-generation--toast-generating-complete--title'
          ),
          {
            closable: true,
            timeOut: 10 * 60 * 1000,
          }
        );
      } else if (
        jobResult.status === CONSTANTS.DECISION_REPORT_JOB_STATUSSES.FAILURE
      ) {
        this.toaster.close(generatingPDFsToast);
        this.toaster.error(
          this.intl.t('error-while-generating-report-pdfs-no-reason')
        );
      } else {
        setTimeout(() => {
          this.pollReplacementReports.perform(
            job,
            reports,
            generatingPDFsToast
          );
        }, 2000);
      }
    }
  });

  async canReplaceReport(report) {
    const hasPreparationActivity = !!(await this.store.queryOne(
      'sign-preparation-activity',
      {
        'filter[sign-marking-activity][piece][:id:]': report.id
      }
    ));
    return !hasPreparationActivity;
  }

  async getAlterableReports(reports) {
    let alterableReports = [];
    let unalterableReports = [];
    for (const report of reports.toArray()) {
      if (await this.canReplaceReport(report)) {
        alterableReports.push(report);
      } else {
        unalterableReports.push(report);
      }
    }
    return { alterableReports, unalterableReports };
  }

  generateReplacementReport = task(async (report) => {
    if (!await this.canReplaceReport(report)) {
      this.toaster.error(
        this.intl.t('report-cannot-be-altered', {
          name: report.name
        })
      );
      return;
    }
    try {
      await this._generateSinglePdf.perform(report, 'generate-decision-report');
      await this.reloadFile(report);
      this.toaster.success(
        this.intl.t(
          'decision-report-generation--toast-generating-single-complete--message'
        )
      );
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-while-generating-report-name-pdf', {
          name: report.name,
          error: error.message,
        })
      );
    }
  });

  generateReplacementMinutes = task(async (minutes) => {
    if (! (await this.canReplaceMinutes(minutes))) {
      this.toaster.error(
        this.intl.t('minutes-cannot-be-altered')
      );
      return;
    }
    try {
      const generatingPDFToast = this.toaster.loading(
        this.intl.t('minutes-report-generation--toast-generating--message'),
        this.intl.t('minutes-report-generation--toast-generating--title'),
        {
          timeOut: 3 * 60 * 1000,
        }
      );
      await this._generateSinglePdf.perform(minutes, 'generate-minutes-report');
      await this.reloadFile(minutes);
      this.toaster.close(generatingPDFToast);
      this.toaster.success(
        this.intl.t(
          'minutes-report-generation--toast-generating-complete--message'
        ),
        this.intl.t(
          'minutes-report-generation--toast-generating-complete--title'
        ),
        {
          closable: true,
          timeOut: 1 * 30 * 1000,
        }
      );
    } catch (error) {
      this.toaster.error(
        error.message,
        this.toaster.error(this.intl.t('error-while-generating-minutes-pdf'))
      );
    }
  });

  async canReplaceMinutes(minutes) {
    const hasPreparationActivity = !!(await this.store.queryOne(
      'sign-preparation-activity',
      {
        'filter[sign-marking-activity][piece][:id:]': minutes.id
      }
    ));
    return !hasPreparationActivity;
  }

  _generateSinglePdf = task(async (report, urlBase) => {
    let response;
    try {
      response = await fetch(`/${urlBase}/${report.id}`);
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

  _generateMultiplePdfs = task(async (reports, urlBase) => {
    let response;
    try {
      response = await fetch(`/${urlBase}/generate-reports`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          reports: reports.map((report) => report.uri),
        }),
      });
      const data = await response.json();
      if (response.status !== 200) {
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

  _generateReportBundle = task(async (meeting) => {
    let response;
    try {
      response = await fetch(
        `/generate-decision-report/generate-reports-bundle`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
          },
          body: JSON.stringify({
            meetingId : meeting.id,
          }),
        }
      );
      const data = await response.json();
      if (response.status !== 200) {
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

  getJob = task(async (job, urlBase) => {
    let response;
    try {
      response = await fetch(`/${urlBase}/job/${job.id}?date=${Date.now()}`);
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

  async reloadFiles(reports) {
    const batchedReports = this.batch(reports, 10);
    for (const batch of batchedReports) {
      await Promise.all(
        batch.map(async (report) => {
          await this.reloadFile(report);
        })
      );
    }
  }

  async reloadFile(reportOrMinutes) {
    await reportOrMinutes.belongsTo('file').reload();
  }

  batch(array, size) {
    let batched = [];
    for (let i = 0; i < array.length; i += size) {
      batched.push(array.slice(i, i + size));
    }
    return batched;
  }
}
