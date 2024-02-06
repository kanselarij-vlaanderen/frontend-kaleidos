import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import * as CONFIG from 'frontend-kaleidos/config/config';

/**
 * @argument title
 * @argument onClose
 * @argument onGenerateReport
 * @argument {{
 *    decisionDateRange?: boolean,
 *    publicationYear?: boolean,
 *    mandateePersons?: boolean,
 *    governmentDomains?: boolean,
 *    regulationTypes?: boolean,
 * }} userInputFields this is an object containing the keys for the input fields to display.
 * @example to display decision date range and government domains:
 * ```javascript
 * {
 *    decisionDateRange: true,
 *    governmentDomains: true,
 * }
 * ```
 */
export default class GenerateReportModalComponent extends Component {
  @service store;
  @service mandatees;

  @tracked decisionDateRangeStart;
  // note: Date object representing the last date of the range
  // API expects next date: in order to include moments over the course the last day
  //  e.g. UI displays 31-12-2022, API expects 01-01-2023
  @tracked decisionDateRangeEnd;
  @tracked decisionDateMin;
  @tracked decisionDateMax;

  @tracked publicationYear;
  @tracked publicationYearMax;
  @tracked publicationYearMin;

  @tracked governmentDomains;
  @tracked selectedGovernmentDomains = [];

  @tracked regulationTypes;
  @tracked selectedRegulationTypes = [];

  constructor() {
    super(...arguments);

    const currentYear = new Date().getFullYear();
    if (this.args.userInputFields.publicationYear) {
      this.publicationYear = currentYear;
      this.publicationYearMin = this.publicationsStartYear;
      this.publicationYearMax = currentYear;
    }

    if (this.args.userInputFields.decisionDateRange) {
      this.decisionDateRangeStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      this.decisionDateRangeEnd = undefined;
      this.decisionDateMin = new Date(this.publicationsStartYear, 0, 1, 0, 0, 0, 0);
      this.decisionDateMax = new Date();
    }

    if (this.args.userInputFields.governmentDomains) {
      this.loadGovernmentDomains.perform();
    }

    if (this.args.userInputFields.regulationTypes) {
      this.loadRegulationTypes.perform();
    }
  }

  get publicationsStartYear() {
    return CONFIG.PUBLICATION_REPORT_START_YEAR;
  }

  get isLoading() {
    return (
      this.loadGovernmentDomains.isRunning || this.loadRegulationTypes.isRunning
    );
  }

  get isDecisionDateRangeStartValid() {
    if (this.decisionDateRangeStart === undefined) return false;
    if (!this.isWithinSensibleRange(this.decisionDateRangeStart)) return false;
    return this.isDecisionDateRangeValid;
  }

  get isDecisionDateRangeEndValid() {
    if (this.decisionDateRangeEnd === undefined) return true;
    if (!this.isWithinSensibleRange(this.decisionDateRangeEnd)) return false;
    return this.isDecisionDateRangeValid;
  }

  isWithinSensibleRange(date) {
    const minDate = new Date(this.publicationsStartYear, 0, 1, 0, 0, 0, 0);
    const currentDate = new Date();
    return minDate <= date && date <= currentDate;
  }

  get isDecisionDateRangeValid() {
    const canValidateRange =
      this.decisionDateRangeStart !== undefined &&
      this.decisionDateRangeEnd !== undefined;
    // return true: no range => so skip this step
    if (!canValidateRange) return true;
    // equality means 1-day range
    return this.decisionDateRangeStart <= this.decisionDateRangeEnd;
  }

  // using getters and setters to transform the year from a string to a number
  // Input uses the property bound to @value to get and set the value
  // It sets it to a string of the inputted number
  // Storing it in the component as a number seems more understandable and usable
  get publicationYearAsString() {
    return this.publicationYear;
  }

  set publicationYearAsString(value) {
    if (value === '') {
      this.publicationYear = undefined;
    } else {
      const number = Number.parseInt(value);
      if (!Number.isNaN(number)) {
        this.publicationYear = number;
      }
    }
  }

  get isPublicationYearValid() {
    const isPresent = this.publicationYear !== undefined;
    if (!isPresent) {
      return false;
    }
    const currentYear = new Date().getFullYear();
    return this.publicationsStartYear <= this.publicationYear && this.publicationYear <= currentYear;
  }

  get dateRange() {
    if (this.args.userInputFields.publicationYear) {
      return convertYearToDateRange(this.publicationYear);
    }
    if (this.args.userInputFields.decisionDate) {
      // NOT IMPLEMENTED: no report type requires this yet
    }
    throw new Error('NOT IMPLEMENTED'); // for linter
  }

  @task
  *loadGovernmentDomains() {
    let governmentDomains = yield this.store.queryAll('concept', {
      'filter[top-concept-schemes][:uri:]':
        CONSTANTS.CONCEPT_SCHEMES.BELEIDSDOMEIN,
      'filter[:has-no:broader]': true, // only top-level government-domains
      ...(this.publicationYear >=
        CONFIG.PUBLICATIONS_IN_KALEIDOS_START_DATE.getFullYear() && {
        'filter[deprecated]': false,
      }), // Exclude deprecated government domains when generating modern reports
    });
    this.governmentDomains = governmentDomains.slice().sortBy('label');
    // everything selected by default
    this.selectedGovernmentDomains = this.governmentDomains.slice(0);
  }

  @action
  onChangeGovernmentDomains(selectedGovernmentDomains) {
    this.selectedGovernmentDomains = selectedGovernmentDomains;
  }

  @task // @task: for consistency with other loadData tasks
  *loadRegulationTypes() {
    let regulationTypes = this.store.peekAll('regulation-type');
    regulationTypes = regulationTypes.slice();
    regulationTypes = regulationTypes.sortBy('position');
    this.regulationTypes = regulationTypes;
    yield; // for linter
    // everything selected by default
    this.selectedRegulationTypes = this.regulationTypes.slice(0);
  }

  @action
  onChangeRegulationTypes(selectedRegulationTypes) {
    this.selectedRegulationTypes = selectedRegulationTypes;
  }

  get isValid() {
    let isValid = true;
    if (this.args.userInputFields.decisionDateRange) {
      isValid &&=
        this.isDecisionDateRangeStartValid && this.isDecisionDateRangeEndValid;
    } else if (this.args.userInputFields.publicationYear) {
      isValid &&= this.isPublicationYearValid;
    }
    return isValid;
  }

  @action
  triggerGenerateReport() {
    const userJobParams = this.buildUserJobParameters();
    this.args.onGenerateReport(userJobParams);
  }

  buildUserJobParameters() {
    const filterParams = {};

    if (this.args.userInputFields.publicationYear) {
      filterParams.publicationDate = convertYearToDateRange(
        this.publicationYear
      );
    }

    if (this.args.userInputFields.decisionDateRange) {
      let decisionDateRangeEnd = this.decisionDateRangeEnd;
      if (decisionDateRangeEnd) {
        decisionDateRangeEnd = new Date(decisionDateRangeEnd);
        decisionDateRangeEnd.setDate(decisionDateRangeEnd.getDate() + 1); // api does expect next date (filters on decisionDate < endDate)
      }
      filterParams.decisionDate = [
        this.decisionDateRangeStart,
        decisionDateRangeEnd,
      ];
    }

    if (this.args.userInputFields.governmentDomains) {
      if (this.selectedGovernmentDomains.length) {
        const governmentDomains = this.selectedGovernmentDomains.map(
          (governmentDomain) => governmentDomain.uri
        );
        filterParams.governmentDomains = governmentDomains;
      }
    }

    if (this.args.userInputFields.regulationTypes) {
      if (this.selectedRegulationTypes.length) {
        const regulationTypes = this.selectedRegulationTypes.map(
          (regulationType) => regulationType.uri
        );
        filterParams.regulationType = regulationTypes;
      }
    }

    if (this.args.userInputFields.mandateePersons) {
      if (this.selectedMandateePersons.length) {
        const mandateePersons = this.selectedMandateePersons.mapBy('uri');
        filterParams.mandateePersons = mandateePersons;
      }
    }

    const userJobParams = {
      query: {
        filter: filterParams,
      },
    };

    return userJobParams;
  }
}

/**
 * convert a year (number) to a Date range
 * start: inclusive
 * end: exclusive
 * @param {number} year
 * @returns {[Date, Date]}
 *  first element: start of the year
 *  second element: start of the next year
 */
function convertYearToDateRange(year) {
  const publicationDateRangeStart = new Date(year, 0, 1, 0, 0, 0, 0); /* eslint-disable-line prettier/prettier */ // (no new line for each number)
  const publicationDateRangeEnd = new Date(year + 1, 0, 1, 0, 0, 0, 0); /* eslint-disable-line prettier/prettier */
  return [publicationDateRangeStart, publicationDateRangeEnd];
}
