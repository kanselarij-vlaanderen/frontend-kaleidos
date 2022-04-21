import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

class PublicationYearField {
  @tracked value;

  constructor() {
    this.value = new Date(Date.now()).getFullYear();
  }

  setQueryFilter(filterParams) {
    const year = Number.parseInt(this.value);
    const yearStartDate = new Date(year, 0, 1, 0, 0, 0, 0);
    const nextYearStartDate = new Date(year + 1, 0, 1, 0, 0, 0, 0);

    filterParams.publicationDate = [yearStartDate, nextYearStartDate];
  }
}

class DecisionDateRangeField {
  @tracked start;
  @tracked end;

  constructor() {
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

const FIELDS = {
  publicationYear: PublicationYearField,
  decisionDateRange: DecisionDateRangeField,
};

export default class GenerateReportModalComponent extends Component {
  @tracked decisionDateRange;
  @tracked publicationYear;

  constructor() {
    super(...arguments);

    const fields = this.args.fields;

    this.fields = {};
    for (const fieldKey in fields) {
      const Field = FIELDS[fieldKey];
      if (!Field) continue;
      const field = new Field();
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
