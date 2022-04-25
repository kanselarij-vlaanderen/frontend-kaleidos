import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

const FIELDS = {};

export default class GenerateReportModalComponent extends Component {
  @service store;

  @tracked decisionDateRangeStart;
  @tracked decisionDateRangeEnd;

  @tracked publicationYearAsNumber;

  @tracked selectedMandatees = [];

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

    let owner = getOwner(this).ownerInjection();
    const fields = this.args.fields;

    this.fields = {};
    for (const fieldKey in fields) {
      const Field = FIELDS[fieldKey];
      if (!Field) continue;
      const field = Field.create(owner, {});
      this.fields[fieldKey] = field;
    }
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
  *searchMandatee(searchText) {
    let persons = this.loadMandatees.last.value;

    if (searchText) {
      searchText = searchText.toLowerCase();
      persons = persons.filter((person) =>
        person.fullName.toLowerCase().includes(searchText)
      );
    }

    return yield persons;
  }

  @task
  *loadMandatees() {
    let [yearStart, nextYearStart] = convertYearToDateRange(
      this.publicationYearAsNumber
    );

    let persons = yield this.store.query('person', {
      include: ['mandatees'].join(','),
      'filter[mandatees][:lt:start]': nextYearStart.toISOString(),
    });
    // mu-cl-resources does not allow filtering on absence of field: end-date (active mandatees)
    persons = yield filterAsync(persons, (person, { mandatees }) =>
      mandatees.some((mandatee) => !mandatee.end || yearStart < mandatee.end)
    );

    return persons;
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

    this.args.onGenerate.perform({
      filter: filterParams,
    });

    yield; // for linter
  }
}

async function filterAsync(persons, fnCheck) {
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
