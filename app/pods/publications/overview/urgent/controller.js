import PublicationsOverviewBaseController from '../_base/controller';

const DEFAULT_COLUMNS = [
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'pageCount',
  'publicationDueDate',
];

export default class PublicationsOverviewUrgentController extends PublicationsOverviewBaseController {
  defaultColumns = DEFAULT_COLUMNS;
  routeName = 'urgent';
}
