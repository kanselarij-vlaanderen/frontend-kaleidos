import PublicationsOverviewBaseController from '../_base/controller';

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
  defaultColumns = DEFAULT_COLUMNS;
  routeName = 'proofread';
}
