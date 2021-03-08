import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default class IconsRoute extends Route.extend(AuthenticatedRouteMixin) {
  model() {
    return [
      'add',
      'alert-triangle',
      'arrow-down',
      'arrow-left',
      'arrow-right',
      'arrow-up',
      'back',
      'calendar-plus',
      'calendar',
      'check',
      'chevron-down',
      'chevron-left',
      'chevron-right',
      'chevron-up',
      'circle-check',
      'circle-info',
      'circle-question',
      'clock',
      'close',
      'comment',
      'delete',
      'document-updated',
      'document',
      'download',
      'drag-handle-2',
      'drag-handle-18',
      'drag-handle',
      'edit',
      'external-link',
      'file',
      'filter',
      'import',
      'lock-closed',
      'more',
      'not-visible',
      'paperclip',
      'redo',
      'remove',
      'search',
      'settings',
      'sitemap',
      'upload',
      'user',
      'visible'
    ];
  }
}
