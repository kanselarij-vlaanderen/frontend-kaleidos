import AbstractPublicationsOverviewBaseController from '../_base/controller';

const defaultColumns = [
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'publicationTargetDate',
  'publicationDueDate',
];

export default class PublicationsOverviewLateController extends AbstractPublicationsOverviewBaseController {
  defaultColumns = defaultColumns;
  routeName = 'late';
}
