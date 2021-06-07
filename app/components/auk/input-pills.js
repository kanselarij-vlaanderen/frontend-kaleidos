import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * @template TItem
 * @argument {ArrayProxy<TItem>} tags
 * @argument {textValue: string) => void} onCreate
 * @argument {(item: TItem) => void} onRemove
 */
export default class AukInputPillsComponent extends Component {
  @action
  onAdd(textValue) {
    this.args.onCreate(textValue);
  }

  @action
  onRemoveTagAtIndex(index) {
    const item = this.args.items.objectAt(index);
    this.args.onRemove(item);
  }
}
