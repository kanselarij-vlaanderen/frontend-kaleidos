import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { Schema } from '@lblod/ember-rdfa-editor';

import {
  // blockquote,
  bullet_list,
  doc,
  hard_break,
  // heading,
  // horizontal_rule,
  // image,
  list_item,
  ordered_list,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';

import {
  em,
  // link,
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/marks';

import {
  subscript,
  subscriptWidget,
} from '@lblod/ember-rdfa-editor/plugins/subscript';

import {
  superscript,
  superscriptWidget,
} from '@lblod/ember-rdfa-editor/plugins/superscript';

import {
  tableKeymap,
  tableMenu,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';

export default class WebComponentsVlRdfaEditor extends Component {
  @service userAgent;

  get browserName() {
    const browser = this.userAgent.browser;
    return browser.info.name;
  }

  get browserIsSupported() {
    const browser = this.userAgent.browser;
    return (window.Cypress
      || browser.isFirefox
      || browser.isChrome
      || browser.isChromeHeadless); // Headless in order not to break automated tests.
  }

  get schema() {
    return new Schema({
      nodes: {
        doc,
        paragraph,
        repaired_block,
        list_item,
        ordered_list,
        bullet_list,
        ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
        // heading,
        // blockquote,
        // horizontal_rule,
        text,
        // image,
        hard_break,
      },
      marks: {
        // link,
        em,
        strong,
        underline,
        strikethrough,
        subscript,
        superscript,
      },
    });
  }

  get widgets() {
    return [
      subscriptWidget,
      superscriptWidget,
      tableMenu,
    ];
  }

  get plugins() {
    return [tablePlugin, tableKeymap];
  }
}
