import Controller from '@ember/controller';

class BaseRow {
  /** @abstract */
  key;

  get titleKey() {
    return `publication-reports--type--${this.key}`;
  }
}

class GovernmentDomainRow extends BaseRow {
  key = 'government-domain';
}

class RegulationTypeRow extends BaseRow {
  key = 'regulation-type';
}

// TODO: will be split up in "van BVR per minister" and "van decreet per minister"
class MandateeRow extends BaseRow {
  key = 'mandatee';
}

export const ReportTypeRows = [
  GovernmentDomainRow,
  RegulationTypeRow,
  MandateeRow,
];

export default class PublicationsOverviewReportsController extends Controller {

}
