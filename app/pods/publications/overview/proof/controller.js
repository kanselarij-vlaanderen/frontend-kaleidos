import PublicationsOverviewBaseController from '../_base/controller';

const DEFAULT_COLUMNS = [
  'isUrgent',
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'pageCount',
  'proofRequestDate',
  'publicationDueDate',
];

export default class PublicationsOverviewProofController extends PublicationsOverviewBaseController {
  defaultColumns = DEFAULT_COLUMNS;
  routeName = 'proof';
}
