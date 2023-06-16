import addLeadingZeros from 'frontend-kaleidos/utils/add-leading-zeros';
import { helper } from '@ember/component/helper';

export default helper((args) => addLeadingZeros(...args));
