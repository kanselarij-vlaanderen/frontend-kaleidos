import AbstractPublicationsOverviewBaseController from '../_base/controller';

const defaultColumns = [
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'pageCount',
  'publicationDueDate',
];

export default class PublicationsOverviewUrgentController extends AbstractPublicationsOverviewBaseController {
  defaultColumns = defaultColumns;
  routeName = 'urgent';
}
