import PublicationsOverviewBaseRoute from './_base';

export default class PublicationsOverviewAllRoute extends PublicationsOverviewBaseRoute {
  defaultColumns = [
    'publicationNumber',
    'shortTitle',
    'publicationDueDate',
    'status',
  ];
}
