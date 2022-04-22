import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import EmberObject, { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

class PublicationYearField extends EmberObject {
  @tracked value;

  get valueAsNumber() {
    return Number.parseInt(this.value);
  }

  constructor() {
    super(...arguments);
    this.value = new Date(Date.now()).getFullYear();
  }

  setQueryFilter(filterParams) {
    const year = this.valueAsNumber;
    const yearStartDate = new Date(year, 0, 1, 0, 0, 0, 0);
    const nextYearStartDate = new Date(year + 1, 0, 1, 0, 0, 0, 0);

    filterParams.publicationDate = [yearStartDate, nextYearStartDate];
  }
}

class DecisionDateRangeField extends EmberObject {
  @tracked start;
  @tracked end;

  constructor() {
    super(...arguments);
    const now = new Date(Date.now());
    this.start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    this.end = new Date(now.getFullYear(), 11, 31, 0, 0, 0, 0); // we only use date part in frontend, so we can leave hour parts === 0
  }

  setQueryFilter(filterParams) {
    let decisionEndDate = this.end;
    if (decisionEndDate) {
      decisionEndDate = new Date(this.end);
      decisionEndDate.setDate(decisionEndDate.getDate() + 1); // api does expect next date (filters on decisionDate < endDate)
    }
    filterParams.decisionDate = [this.start, decisionEndDate];
  }
}

class MandateeField extends EmberObject {
  @service store;

  @tracked value = [];

  @action
  triggerLoadData(el, [year]) {
    this.loadData.perform(year);
  }

  @action
  search(searchText) {
    let persons = this.loadData.last.value;

    if (searchText) {
      searchText = searchText.toLowerCase();
      persons = persons.filter((person) =>
        person.fullName.toLowerCase().includes(searchText)
      );
    }

    return persons;
  }

  @task
  *loadData(year) {
    const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
    const nextYearStart = new Date(year + 1, 0, 1, 0, 0, 0, 0);

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

  setQueryFilter(filterParams) {
    const personUriArray = this.value.map((person) => person.uri);
    const mandateeArray = personUriArray.map((uri) => ({ person: uri }));
    filterParams.mandatee = mandateeArray;
  }
}

const FIELDS = {
  publicationYear: PublicationYearField,
  decisionDateRange: DecisionDateRangeField,
  mandatee: MandateeField,
};

export default class GenerateReportModalComponent extends Component {
  @service store;

  @tracked decisionDateRange;
  @tracked publicationYear;

  constructor() {
    super(...arguments);

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

  @task
  *triggerGenerateReport() {
    const queryFilter = {};
    for (const fieldKey in this.fields) {
      const field = this.fields[fieldKey];
      field.setQueryFilter(queryFilter);
    }

    this.args.onGenerate.perform({
      filter: queryFilter,
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
