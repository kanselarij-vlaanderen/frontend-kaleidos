import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import CONFIG from 'frontend-kaleidos/config/config';

export default class GenerateReportModalComponent extends Component {
  @service store;

  @tracked decisionDateRangeStart;
  // note: Date object representing the last date of the range
  // API expects next date: in order to include moments over the course the last day
  //  e.g. UI displays 31-12-2022, API expects 01-01-2023
  @tracked decisionDateRangeEnd;

  @tracked publicationYear;

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
    }

    if (this.args.userInputFields.decisionDateRange) {
      this.decisionDateRangeStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      this.decisionDateRangeEnd = undefined;
    }

    if (this.args.userInputFields.governmentDomain) {
      this.loadGovernmentDomains.perform();
    }

    if (this.args.userInputFields.regulationType) {
      this.loadRegulationTypes.perform();
    }
  }

  get isLoading() {
    return (
      this.loadGovernmentDomains.isRunning ||
      this.loadRegulationTypes.isRunning
    );
  }

  get isDecisionDateRangeStartValid() {
    const isPresent = this.decisionDateRangeStart !== undefined;
    if (!isPresent) {
      return false;
    }
    const isWithinSensibleRange = this.isWithinSensibleRange(
      this.decisionDateRangeStart
    );
    if (!isWithinSensibleRange) {
      return false;
    }
    const isDecisionDateRangeValid = this.isDecisionDateRangeValid;
    return isDecisionDateRangeValid;
  }

  get isDecisionDateRangeEndValid() {
    const isPresent = this.decisionDateRangeEnd !== undefined;
    if (!isPresent) {
      return true;
    }
    const isWithinSensibleRange = this.isWithinSensibleRange(
      this.decisionDateRangeEnd
    );
    if (!isWithinSensibleRange) {
      return false;
    }
    const isDecisionDateRangeValid = this.isDecisionDateRangeValid;
    return isDecisionDateRangeValid;
  }

  isWithinSensibleRange(date) {
    const minDate = new Date(1981, 1, 0, 0, 0, 0, 0);
    const currentDate = new Date();
    return minDate <= date && date <= currentDate;
  }

  get isDecisionDateRangeValid() {
    const canValidateRange =
      this.decisionDateRangeStart !== undefined &&
      this.decisionDateRangeEnd !== undefined;
    if (!canValidateRange) {
      // since it is not a range, it is not a valid range either
      // return true: in order not to show errors to "skip" this check
      return true;
    }
    return this.decisionDateRangeStart < this.decisionDateRangeEnd;
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
      // necessary to convert string value of <Input /> (even with @type="number")
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

  get dateRange() {
    if (this.args.userInputFields.publicationYear) {
      return convertYearToDateRange(this.publicationYear);
    }
    if (this.args.userInputFields.decisionDate) {
      // NOT IMPLEMENTED: no report type requires this
    }
    throw new Error('NOT IMPLEMENTED'); // for linter
  }

  @task
  *loadMandateePersons() {
    // set mandatees to unresolved promise in order to notify EmberPowerSelect of loading state
    this.mandateePersons = this.searchMandateePersons.perform(undefined);
    yield;
  }

  @task
  *searchMandateePersons(searchText) {
    const [dateRangeStart, dateRangeEnd] = this.dateRange;

    // no filter on mandatee.mandate.role or government-body
    //  * allow old publication-flows to be searched
    //      which have a different role and government-body
    const commonQueryOptions = {
      'filter[:has:mandatees]': true,
      'filter[mandatees][:lte:start]':
        toDateWithoutUTCOffset(dateRangeEnd).toISOString(), // active ranges of mandatees are stored as dateTimes, but with time set to 0:00 UTC
      // since the frontend is in a different timezone, the we need to compensate for this
      'filter[last-name]': searchText, // Ember Data leaves this of when set to undefined (=> no filtering)
      // although we sort and paginate again on the frontend, this is useful for pagination
      sort: 'last-name',
      'page[size]': CONFIG.SELECT, // maximum number of shown mandatees for each type (some might be double and filtered out)
    };

    const pastQueryOptions = {
      ...commonQueryOptions,
      'filter[mandatees][:gt:end]':
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
      .slice(0, CONFIG.SELECT);

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

  @task
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
      isValid &&= this.isDecisionDateRangeStartValid && this.isDecisionDateRangeEndValid;
    } else if (this.args.userInputFields.publicationYear) {
      isValid &&= this.isPublicationYearValid;
    }
    return isValid;
  }

  @task
  *triggerGenerateReport() {
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

    if (this.args.userInputFields.mandatee) {
      if (this.selectedMandateePersons.length) {
        const mandateeArray = this.selectedMandateePersons.map((person) => ({
          person: person.uri,
        }));
        filterParams.mandatee = mandateeArray;
      }
    }

    if (this.args.userInputFields.governmentDomain) {
      if (this.selectedGovernmentDomains.length) {
        const governmentDomainArray = this.selectedGovernmentDomains.map(
          (governmentDomain) => governmentDomain.uri
        );
        filterParams.governmentDomain = governmentDomainArray;
      }
    }

    if (this.args.userInputFields.regulationType) {
      if (this.selectedRegulationTypes.length) {
        const regulationTypeArray = this.selectedRegulationTypes.map(
          (regulationType) => regulationType.uri
        );
        filterParams.regulationType = regulationTypeArray;
      }
    }

    const userParams = {
      query: {
        filter: filterParams,
      },
    };
    this.args.onGenerateReport(userParams);

    yield; // for linter
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
