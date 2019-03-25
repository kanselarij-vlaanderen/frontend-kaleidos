import { helper } from '@ember/component/helper';

export function checkMandateesOfDomain(params, items) {

  const domainMandatees = items.domainMandatees;
  const mandatee = items.mandatee;
  let found = domainMandatees.find(item => item.id === mandatee.id);

  if(found) {
    return true;
  } else {
    return false;
  }
}

export default helper(checkMandateesOfDomain);
