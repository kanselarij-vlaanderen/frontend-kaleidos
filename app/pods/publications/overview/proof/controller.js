import AbstractPublicationsOverviewBaseController from '../_base/controller';

const DEFAULT_COLUMNS = [
  'isUrgent',
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'pageCount',
  'proofRequestDate',
  'publicationDueDate',
];

export default class PublicationsOverviewProofController extends AbstractPublicationsOverviewBaseController {
  defaultColumns = DEFAULT_COLUMNS;
  routeName = 'proof';
}
