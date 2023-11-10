import ApplicationAdapter from './application';

export default class ReportAdapter extends ApplicationAdapter {
  findBelongsTo(store, snapshot, url) {
    if (url.endsWith('sign-marking-activity')) {
      url += `?cache-busting=${new Date().toISOString()}`;
    }
    return super.findBelongsTo(store, snapshot, url);
  }
}
