import AbstractPublicationsOverviewBaseController from '../_base/controller';

const defaultColumns = [
  'publicationNumber',
  'shortTitle',
  'publicationDueDate',
  'status',
];

export default class PublicationsOverviewAllController extends AbstractPublicationsOverviewBaseController {
  defaultColumns = defaultColumns;
  routeName = 'all';
}
