import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { Schema } from 'prosemirror-model';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
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
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import {
  bulletListWithConfig,
  listItemWithConfig,
  listTrackingPlugin,
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';

export const section_rdfa = {
  content: 'block+',
  group: 'block',
  attrs: {
    "data-section": { default: null },
  },
  defining: true,
  isolating: true, // to ensure these blocks can't be joined into 1
  parseDOM: [
    {
      tag: `section`,
      getAttrs(node) {
        return {"data-section": node.getAttribute("data-section")}
      },
    },
  ],
  toDOM(node) {
    return ['section', node.attrs, 0];
  },
}

export default class WebComponentsRdfaEditor extends Component {
  @service userAgent;
  @tracked controller;

  get sizeClass() {
    if (this.args.size == 'small') return 'wc-rdfa-editor--small';
    else if (this.args.size == 'fullscreen') return 'wc-rdfa-editor--fullscreen';
    else return '';
  }

  get plugins() {
    return [
      listTrackingPlugin(),
      ...tablePlugins,
      tableKeymap,
    ];
  }

  get browserName() {
    const browser = this.userAgent.browser;
    return browser.info.name;
  }

  get browserIsSupported() {
    const browser = this.userAgent.browser;
    return (
      window.Cypress ||
      browser.isFirefox ||
      browser.isChrome ||
      browser.isEdge ||
      browser.isChromeHeadless
    ); // Headless in order not to break automated tests.
  }

  get schema() {
    return new Schema({
      nodes: {
        doc,
        paragraph,
        section_rdfa,
        repaired_block,
        list_item: listItemWithConfig({ enableHierarchicalList: true }),
        ordered_list: orderedListWithConfig({ enableHierarchicalList: true }),
        bullet_list: bulletListWithConfig({ enableHierarchicalList: true }),
        ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
        heading,
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
