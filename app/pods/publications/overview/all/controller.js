import AbstractPublicationsOverviewBaseController from '../_base/controller';

const DEFAULT_COLUMNS = [
  'publicationNumber',
  'shortTitle',
  'publicationDueDate',
  'status',
];

export default class PublicationsOverviewAllController extends AbstractPublicationsOverviewBaseController {
  defaultColumns = DEFAULT_COLUMNS;
  routeName = 'all';
}
