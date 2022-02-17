import PublicationsOverviewBaseRoute from '../_base/route';

export default class PublicationsOverviewAllRoute extends PublicationsOverviewBaseRoute {
  defaultColumns = [
    'publicationNumber',
    'shortTitle',
    'publicationDueDate',
    'status',
  ];
}
