import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

import {
  Schema,
} from '@lblod/ember-rdfa-editor';

import {
  block_rdfa,
  doc,
  hard_break,
  invisible_rdfa,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';

import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';

import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';

import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';

import {
  bullet_list,
  list_item,
  ordered_list,
} from '@lblod/ember-rdfa-editor/plugins/list';

export default class WebComponentsVlRdfaEditor extends Component {
  @service userAgent;

  @tracked controller;
  @tracked plugins = [tablePlugin, tableKeymap];

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
        text,
        hard_break,
        invisible_rdfa,
        block_rdfa,
      },
      marks: {
        inline_rdfa,
        em,
        strong,
        underline,
        strikethrough,
        subscript,
        superscript,
      },
    });
  }

  @action
  onEditorInit(controller) {
    this.controller = controller;

    if (isPresent(this.args.handleRdfaEditorInit)) {
      return this.args.handleRdfaEditorInit(this.controller);
    }
  }
}
