import PublicationsOverviewBaseController from '../_base/controller';
import { tracked } from '@glimmer/tracking';

const DEFAULT_COLUMNS = [
  'isUrgent',
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'pageCount',
  'proofReceivedDate',
  'proofPrintCorrector',
  'publicationDueDate',
];

export default class PublicationsOverviewProofreadController extends PublicationsOverviewBaseController {
  @tracked defaultColumns = DEFAULT_COLUMNS;
}
