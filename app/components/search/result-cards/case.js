import ENV from 'frontend-kaleidos/config/environment';
import Component from '@glimmer/component';

export default class Case extends Component {
  get sanitizeHtmlOptions() {
    return ENV['sanitize-html'];
  }
}
