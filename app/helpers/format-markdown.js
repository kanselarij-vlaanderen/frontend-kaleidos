import marked from 'marked';
import { htmlSafe } from '@ember/template';
import { helper as buildHelper } from '@ember/component/helper';

export default buildHelper((params) => {
  const value = params[0];
  return htmlSafe(marked(value));
});
