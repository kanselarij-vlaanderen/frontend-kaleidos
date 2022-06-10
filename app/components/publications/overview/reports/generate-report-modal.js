import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
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

  // LIMITATION:
  //  1. a person will not show up in the select
  //    if: a mandatee resigned in the year before the publication
  //  2. a person can be selected person that was not a mandatee in that year
  //    if a person is selected
  //      and then the publication year is changed
  @tracked mandateePersons;
  @tracked selectedMandateePersons = [];

  @tracked governmentDomains;
  @tracked selectedGovernmentDomains = [];

  @tracked regulationTypes;
  @tracked selectedRegulationTypes = [];

  constructor() {
    super(...arguments);

    const currentYear = new Date().getFullYear();
    if (this.args.userInputFields.publicationYear) {
      this.publicationYear = currentYear;
      this.publicationYearMin = 1981;
      this.publicationYearMax = currentYear;
    }

    if (this.args.userInputFields.decisionDateRange) {
      this.decisionDateRangeStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      this.decisionDateRangeEnd = undefined;
      this.decisionDateMin = new Date(1981, 0, 1, 0, 0, 0, 0);
      this.decisionDateMax = new Date();
    }

    if (this.args.userInputFields.governmentDomains) {
      this.loadGovernmentDomains.perform();
    }

    if (this.args.userInputFields.regulationTypes) {
      this.loadRegulationTypes.perform();
    }
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
    const minDate = new Date(1981, 0, 1, 0, 0, 0, 0);
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
    return 1981 <= this.publicationYear && this.publicationYear <= currentYear;
  }

  // gets the date range selected by the user
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
  *loadMandateePersons() {
    // set mandatees to unresolved promise in order to notify EmberPowerSelect of loading state
    // this are the default options of the EmberPowerSelect (no searchText)
    this.mandateePersons = this.fetchMandateePersons.perform(undefined);
    yield;
  }

  @task({
    restartable: true,
  })
  // only called when search text input is not empty
  *searchMandateePersons(searchText) {
    yield timeout(CONFIG.LIVE_SEARCH_DEBOUNCE_TIME);
    return this.fetchMandateePersons.perform(searchText);
  }

  @task
  *fetchMandateePersons(searchText) {
    // TODO: this task logic can be replaced by calling the right method from the
    // mandatee-service and mapping mandatee results to persons.
    const [dateRangeStart, dateRangeEnd] = this.dateRange;

    // As long as mu-cl-resources does not support an OR filter
    //    that allows the end date to be empty or after a specific date
    //    we need to separate the filter in two requests

    const commonQueryOptions = {
      'filter[:has:mandatees]': true,
      // DISABLED: query timeouts
      // 'filter[mandatees][mandate][role][:id:]': this.visibleRoles.map((role) => role.id).join(','),
      // active ranges of mandatees are stored as dateTimes, but with time set to 0:00 UTC
      // since the frontend is in a different timezone, we need to compensate for this
      'filter[mandatees][:lt:start]':
        toDateWithoutUTCOffset(dateRangeEnd).toISOString(),
      'filter[last-name]': searchText, // Ember Data leaves this of when set to undefined (=> no filtering)
      // although we sort and paginate again on the frontend
      //   after combining both query results
      //   sorting an pagination are useful for limiting the payload size
      sort: 'last-name',
      'page[size]': CONFIG.PAGE_SIZE.SELECT,
    };

    const pastQueryOptions = {
      ...commonQueryOptions,
      'filter[mandatees][:gte:end]':
        toDateWithoutUTCOffset(dateRangeStart).toISOString(),
    };
    const pastMandateePersons = this.store.query('person', pastQueryOptions);

    const currentQueryOptions = {
      ...commonQueryOptions,
      // HACK: mu-cl-resources quirk: has-no is intended to be used with relationships,
      //   but seems to be working with an attribute in this case.
      //   It might change with mu-cl-resource updates.
      'filter[mandatees][:has-no:end]': true,
    };
    const currentMandateePersons = this.store.query(
      'person',
      currentQueryOptions
    );

    let mandateePersons = yield Promise.all([
      pastMandateePersons,
      currentMandateePersons,
    ]);
    mandateePersons = mandateePersons
      .map((persons) => persons.toArray())
      .flat()
      .uniq()
      .sortBy('lastName')
      .slice(0, CONFIG.PAGE_SIZE.SELECT);

    return mandateePersons;
  }

  @task
  *loadGovernmentDomains() {
    let governmentDomains = yield this.store.query('concept', {
      'filter[top-concept-schemes][:uri:]':
        CONSTANTS.CONCEPT_SCHEMES.BELEIDSDOMEIN,
      'filter[:has-no:broader]': true, // only top-level government-domains
      'filter[deprecated]': false,
      'page[size]': 100,
    });
    this.governmentDomains = governmentDomains.toArray().sortBy('label');
  }

  @action
  selectGovernmentDomain(governmentDomain, ev) {
    const checked = ev.target.checked;
    if (checked) {
      this.selectedGovernmentDomains.addObject(governmentDomain); // addObject ensures no duplicates
    } else {
      this.selectedGovernmentDomains.removeObject(governmentDomain);
    }
  }

  @task // @task: for consistency with other loadData tasks
  *loadRegulationTypes() {
    let regulationTypes = this.store.peekAll('regulation-type');
    regulationTypes = regulationTypes.toArray();
    regulationTypes = regulationTypes.sortBy('position');
    this.regulationTypes = regulationTypes;
    yield; // for linter
  }

  @action
  selectRegulationType(regulationType, ev) {
    const checked = ev.target.checked;
    if (checked) {
      this.selectedRegulationTypes.addObject(regulationType); // addObject ensures no duplicates
    } else {
      this.selectedRegulationTypes.removeObject(regulationType);
    }
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

/**
 * Get Date minus the timezone offset from UTC.
 * @param {Date} date
 * @returns {Date}
 */
function toDateWithoutUTCOffset(date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}
