import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class DecisionReportGeneration extends Service {
  @service toaster;
  @service store;
  @service intl;

  generateReplacementReports = task(async (reports) => {
    const generatingPDFToast = this.toaster.loading(
      this.intl.t('decision-report-generation--toast-generating--message', {
        total: reports.length,
      }),
      this.intl.t('decision-report-generation--toast-generating--title'),
      {
        timeOut: 10 * 60 * 1000,
      }
    );
    const batchedReports = this.batch(reports, 10);
    let updatedReports = [];
    let failedReports = [];
    for (const batch of batchedReports) {
      await Promise.all(
        batch.map(async (report) => {
          try {
            await this.generateSinglePdf.perform(
              report,
              'generate-decision-report'
            );
            await this.reloadFile(report);
            updatedReports.push(report);
          } catch (error) {
            failedReports.push({ report, error });
          }
        })
      );
    }
    this.toaster.close(generatingPDFToast);
    if (failedReports.length) {
      for (const failure of failedReports) {
        this.toaster.error(
          this.intl.t('error-while-generating-report-name-pdf', {
            name: failure.report.name,
            error: failure.error.message,
          })
        );
      }
    }
    if (updatedReports.length) {
      this.toaster.success(
        this.intl.t(
          'decision-report-generation--toast-generating-complete--message',
          {
            total: updatedReports.length,
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
    }
  });

  generateReplacementReport = task(async (report) => {
    try {
      await this.generateSinglePdf.perform(report, 'generate-decision-report');
      await this.reloadFile(report);
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
    try {
      const generatingPDFToast = this.toaster.loading(
        this.intl.t('minutes-report-generation--toast-generating--message'),
        this.intl.t('minutes-report-generation--toast-generating--title'),
        {
          timeOut: 3 * 60 * 1000,
        }
      );
      await this.generateSinglePdf.perform(minutes, 'generate-minutes-report');
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

  generateSinglePdf = task(async (report, urlBase) => {
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
