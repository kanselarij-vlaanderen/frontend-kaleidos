import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class GenerateReportModalComponent extends Component {
  @service store;

  @tracked decisionDateRangeStart;
  @tracked decisionDateRangeEnd;

  @tracked publicationYearAsNumber;

  @tracked mandatees;
  @tracked selectedMandatees = [];

  @tracked governmentDomains;
  @tracked selectedGovernmentDomains = [];

  @tracked regulationTypes;
  @tracked selectedRegulationTypes = [];

  constructor() {
    super(...arguments);

    const currentYear = new Date(Date.now()).getFullYear();
    if (this.args.fields.publicationYear) {
      this.publicationYear = currentYear;
    }

    if (this.args.fields.decisionDateRange) {
      this.decisionDateRangeStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      this.decisionDateRangeEnd = new Date(currentYear, 11, 31, 0, 0, 0, 0); // we only use date part in frontend, so we can leave hour parts === 0
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
      this.loadGovernmentDomains.isRunning &&
      this.loadRegulationTypes.isRunning &&
      this.loadMandatees.isRunning
    );
  }

  get publicationYear() {
    /// <Input /> expects property for get and set (no callback)
    return this.publicationYearAsNumber;
  }

  set publicationYear(value) {
    // necessary to convert string value of <Input /> (even with @type="number")
    let number = Number.parseInt(value);
    if (!Number.isNaN(number)) {
      this.publicationYearAsNumber = number;
    }
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
    this.mandatees = mandatees.sortBy('lastName');
  }

  // options and search are separate tasks
  // - mandateesOptionsTask.last.value is the default list of mandatees
  //   shown when the power-select is opened or the searchText is cleared
  //   task is triggered onOpen, to take in account that the date range filter might have been changed
  //   use of task: power-select bases on task status to shows loading message
  // - searchMandatee
  //   it is shown when the user enters searchText in the power-select
  @task
  *filterMandateesTask() {
    return yield this.filterMandatees(this.mandatees);
  }

  @task
  *searchMandatee(searchText) {
    return yield this.filterMandatees(this.mandatees, searchText);
  }

  async filterMandatees(persons, searchText) {
    if (searchText) {
      searchText = searchText.toLowerCase();
      persons = persons.filter((person) =>
        person.fullName.toLowerCase().includes(searchText)
      );
    }

    let [yearStart, nextYearStart] = convertYearToDateRange(
      this.publicationYearAsNumber
    ); // does not work for decisionDateRange filter
    // currently the mandatee filter is only used in combination with the publicationYear filter
    // POSSIBLE ISSUE: publicationYear might not overlap with mandate date range

    persons = await filterAsync(persons, (person, { mandatees }) =>
      mandatees.some(
        (mandatee) =>
          nextYearStart < mandatee.start &&
          (!mandatee.end || yearStart < mandatee.end)
      )
    );

    return persons;
  }

  @task
  *loadGovernmentDomains() {
    let governmentDomains = yield this.store.query('concept', {
      'filter[top-concept-schemes][:uri:]':
        CONSTANTS.CONCEPT_SCHEMES.BELEIDSDOMEIN,
      'filter[:has-no:broader]': true, // only top-level government-domains
      'filter[deprecated]': false,
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

  @task
  *triggerGenerateReport() {
    const filterParams = {};

    if (this.args.fields.publicationYear) {
      filterParams.publicationDate = convertYearToDateRange(
        this.publicationYearAsNumber
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
      const mandateeArray = this.selectedMandatees.map((person) => ({
        person: person.uri,
      }));
      filterParams.mandatee = mandateeArray;
    }

    if (this.args.fields.governmentDomain) {
      const governemtDomainArray = this.selectedGovernmentDomains.map(
        (governmentDomain) => governmentDomain.uri
      );
      filterParams.governmentDomain = governemtDomainArray;
    }

    if (this.args.fields.regulationType) {
      const regulationTypeArray = this.selectedRegulationTypes.map(
        (regulationType) => regulationType.uri
      );
      filterParams.regulationType = regulationTypeArray;
    }

    this.args.onGenerate.perform({
      filter: filterParams,
    });

    yield; // for linter
  }
}

async function filterAsync(persons, fnCheck) {
  /// abstract complexity of filtering with async & ember data record arrays from actual check
  persons = persons.map(async (person) => {
    let mandatees = await person.mandatees;
    mandatees = mandatees.toArray();
    const shouldFilter = fnCheck(person, { mandatees });
    return shouldFilter ? person : undefined;
  });
  persons = await Promise.all(persons);
  persons = persons.compact();
  return persons;
}

function convertYearToDateRange(year) {
  const publicationDateRangeStart = new Date(year, 0, 1, 0, 0, 0, 0); /* eslint-disable-line prettier/prettier */ // (no new line for each number)
  const publicationDateRangeEnd = new Date(year + 1, 0, 1, 0, 0, 0, 0); /* eslint-disable-line prettier/prettier */
  return [publicationDateRangeStart, publicationDateRangeEnd];
}
