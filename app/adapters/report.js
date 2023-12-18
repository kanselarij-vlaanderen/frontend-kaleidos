import ApplicationAdapter from './application';

const BUST_THE_CACHE = [
  'sign-marking-activity',
  'submitted-piece',
];

export default class ReportAdapter extends ApplicationAdapter {
  findBelongsTo(store, snapshot, url) {
    if (BUST_THE_CACHE.some((relationPath) => url.endsWith(relationPath))) {
      url += `?cache-busting=${new Date().toISOString()}`;
    }
    return super.findBelongsTo(store, snapshot, url);
  }
}
