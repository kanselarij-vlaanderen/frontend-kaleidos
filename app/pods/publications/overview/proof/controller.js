import AbstractPublicationsOverviewBaseController from '../_base/controller';

const defaultColumns = [
  'isUrgent',
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'pageCount',
  'proofRequestDate',
  'publicationDueDate',
];

export default class PublicationsOverviewProofController extends AbstractPublicationsOverviewBaseController {
  defaultColumns = defaultColumns;
  routeName = 'proof';
}
