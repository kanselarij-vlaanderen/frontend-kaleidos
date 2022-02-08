import AbstractPublicationsOverviewBaseController from '../_base/controller';

const defaultColumns = [
  'isUrgent',
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'pageCount',
  'proofReceivedDate',
  'proofPrintCorrector',
  'publicationDueDate',
];

export default class PublicationsOverviewProofreadController extends AbstractPublicationsOverviewBaseController {
  defaultColumns = defaultColumns;
  routeName = 'proofread';
}
