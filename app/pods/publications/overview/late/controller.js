import AbstractPublicationsOverviewBaseController from '../_base/controller';

const DEFAULT_COLUMNS = [
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'publicationTargetDate',
  'publicationDueDate',
];

export default class PublicationsOverviewLateController extends AbstractPublicationsOverviewBaseController {
  defaultColumns = DEFAULT_COLUMNS;
  routeName = 'late';
}
