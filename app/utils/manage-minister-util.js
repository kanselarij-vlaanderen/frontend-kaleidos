import EmberObject from '@ember/object';

export async function refreshData(mandatee, mandateeRows) {
  const iseCodes = (await mandatee.get('iseCodes')).filter((item) => item);
  const fields = (await Promise.all(iseCodes.map((iseCode) => iseCode.get('field')))).filter((item) => item);
  const domains = await Promise.all(fields.map((field) => field.get('domain')));

  const rowToShow = EmberObject.create({
    domains: [...new Set(domains)],
    fields: [...new Set(fields)]
  });
  rowToShow.get('domains').map((domain) => domain.set('selected', false));
  rowToShow.get('fields').map((domain) => domain.set('selected', false));

  if (!mandateeRows) {
    rowToShow.set('isSubmitter', true);
  }
  return rowToShow;
}
