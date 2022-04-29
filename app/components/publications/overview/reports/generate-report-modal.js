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
  @tracked decisionDateRangeEnd;

  @tracked publicationYear;

  @tracked mandatees;
  @tracked selectedMandatees = [];

  @tracked governmentDomains;
  @tracked selectedGovernmentDomains = [];

  @tracked regulationTypes;
  @tracked selectedRegulationTypes = [];

  constructor() {
    super(...arguments);

    const currentYear = new Date().getFullYear();
    if (this.args.fields.publicationYear) {
      this.publicationYear = currentYear;
    }

    if (this.args.fields.decisionDateRange) {
      this.decisionDateRangeStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      this.decisionDateRangeEnd = undefined;
    }

    if (this.args.fields.mandatee) {
      this.loadMandatees.perform();
    }

    if (this.args.fields.governmentDomain) {
      this.loadGovernmentDomains.perform();
    }

    if (this.args.fields.regulationType) {
      this.loadRegulationTypes.perform();
    }
  }

  get isLoading() {
    return (
      this.loadGovernmentDomains.isRunning ||
      this.loadRegulationTypes.isRunning ||
      this.loadMandatees.isRunning
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
    // necessary to convert string value of <Input /> (even with @type="number")
    const number = Number.parseInt(value);
    if (!Number.isNaN(number)) {
      this.publicationYear = number;
    }
  }

  get isPublicationYearValid() {
    const currentYear = new Date().getFullYear();
    return this.publicationYear >= 1981 && this.publicationYear <= currentYear;
  }

  @task
  *loadMandatees() {
    // at the moment filtering is done on frontend
    // mu-cl-resources does not allow filtering on absence of field: end-date (active mandatees)
    // this makes the response list large
    // => therefore fetching it once seems more performant
    let mandatees = yield this.store.query('person', {
      include: ['mandatees'].join(','),
    });
    mandatees = mandatees.toArray();
    this.mandatees = mandatees.sortBy('lastName');
  }

  get mandateesOptions() {
    return this.filterMandatees();
  }

  @task
  *searchMandatee(searchText) {
    return yield this.filterMandatees(searchText);
  }

  filterMandatees(searchText) {
    let persons = this.mandatees;
    if (!persons) {
      return;
    }

    if (searchText) {
      searchText = searchText.toLowerCase();
      persons = persons.filter((person) =>
        person.fullName.toLowerCase().includes(searchText)
      );
    }

    const [yearStart, nextYearStart] = convertYearToDateRange(
      this.publicationYear
    ); // does not work for decisionDateRange filter
    // currently the mandatee filter is only used in combination with the publicationYear filter
    // POSSIBLE ISSUE: publicationYear might not overlap with mandate date range

    persons = persons.filter((person) => {
      // not using await in order in order to use mandateeOptions getter
      let mandatees = person.get('mandatees');
      mandatees = mandatees.toArray();
      return mandatees.some(
        (mandatee) =>
          nextYearStart < mandatee.start &&
          (!mandatee.end || yearStart < mandatee.end)
      );
    });

    return persons;
  }

  @task
  *loadGovernmentDomains() {
    let governmentDomains = yield this.store.query('concept', {
      'filter[top-concept-schemes][:uri:]':
        CONSTANTS.CONCEPT_SCHEMES.BELEIDSDOMEIN,
      'filter[:has-no:broader]': true, // only top-level government-domains
      'filter[deprecated]': false,
      'page[size]': CONFIG.PAGE_SIZE.CODE_LISTS,
    });
    governmentDomains = governmentDomains.toArray();
    governmentDomains = governmentDomains.sortBy('label');
    this.governmentDomains = governmentDomains;
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
    if (this.args.fields.decisionDateRange) {
      isValid &&= this.isDecisionDateRangeStartValid;
    } else if (this.args.fields.publicationYear) {
      isValid &&= this.isPublicationYearValid;
    }
    return isValid;
  }

  @task
  *triggerGenerateReport() {
    const filterParams = {};

    if (this.args.fields.publicationYear) {
      filterParams.publicationDate = convertYearToDateRange(
        this.publicationYear
      );
    }

    if (this.args.fields.decisionDateRange) {
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

    if (this.args.fields.mandatee) {
      if (this.selectedMandatees.length) {
        const mandateeArray = this.selectedMandatees.map((person) => ({
          person: person.uri,
        }));
        filterParams.mandatee = mandateeArray;
      }
    }

    if (this.args.fields.governmentDomain) {
      if (this.selectedGovernmentDomains.length) {
        const governmentDomainArray = this.selectedGovernmentDomains.map(
          (governmentDomain) => governmentDomain.uri
        );
        filterParams.governmentDomain = governmentDomainArray;
      }
    }

    if (this.args.fields.regulationType) {
      if (this.selectedRegulationTypes.length) {
        const regulationTypeArray = this.selectedRegulationTypes.map(
          (regulationType) => regulationType.uri
        );
        filterParams.regulationType = regulationTypeArray;
      }
    }

    this.args.onGenerate.perform({
      filter: filterParams,
    });

    yield; // for linter
  }
}

/**
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
