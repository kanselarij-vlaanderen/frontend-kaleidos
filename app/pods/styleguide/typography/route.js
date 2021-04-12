import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default class TypographyRoute extends Route.extend(AuthenticatedRouteMixin) {
  model() {
    return [
      {
        name: 'Heading 1',
        code: '<h1 class="auk-h1">A first level heading</h1>',
      },
      {
        name: 'Heading 2',
        code: '<h2 class="auk-h2">A second level heading</h2>',
      },
      {
        name: 'Heading 3',
        code: '<h3 class="auk-h3">A third level heading</h3>',
      },
      {
        name: 'Heading 4',
        code: '<h4 class="auk-h4">A fourth level heading</h4>',
      },
      {
        name: 'Overline',
        code: '<p class="auk-overline">Overline</p>',
      },
      {
        name: 'Body 1',
        code: '<p class="auk-body-1">This longer body text where we show a bit more content in a paragraph is set as <strong>body 1</strong>, and it contains <em>italic</em> text.</p>',
      },
      {
        name: 'Body 2',
        code: '<p class="auk-body-2">This longer body text where we show a bit more content in a paragraph is set as <strong>body 2</strong>, and it contains <em>italic</em> text.</p>',
      },
      {
        name: 'Muted text',
        code: '<p class="auk-u-muted">This longer body text where we show a bit more content in a paragraph is set as <strong>muted text</strong>, and it contains <em>italic</em> text.</p>',
      },
      {
        name: 'Unordered list',
        code: '<ul class="auk-ul"><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>',
      }
    ];
  }
}
