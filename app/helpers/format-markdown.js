import { marked } from 'marked';
import { htmlSafe } from '@ember/template';
import { helper as buildHelper } from '@ember/component/helper';

export default buildHelper(([value]) => {
  return htmlSafe(marked(value));
});
