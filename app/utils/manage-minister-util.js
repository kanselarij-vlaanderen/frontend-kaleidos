import EmberObject from '@ember/object';

export const refreshData = async(mandatee, mandateeRows) => {
  const iseCodes = (await mandatee.get('iseCodes')).filter((iseCode) => iseCode);
  const fields = (await Promise.all(iseCodes.map((iseCode) => iseCode.get('field')))).filter((field) => field);
  const domains = await Promise.all(fields.map((field) => field.get('domain')));

  const mandateeRow = EmberObject.create({
    domains: [...new Set(domains)],
    fields: [...new Set(fields)],
  });
  mandateeRow.get('domains').map((domain) => domain.set('selected', false));
  mandateeRow.get('fields').map((domain) => domain.set('selected', false));

  if (!mandateeRows) {
    mandateeRow.set('isSubmitter', true);
  }
  return mandateeRow;
};

export const selectDomain = async(rowToShowFields, domain, value) => {
  const fields = await rowToShowFields.filter((field) => field.get('domain.id') === domain.get('id'));
  fields.map((field) => field.set('selected', value));
};

export const selectField = async(rowToShowDomains, domain, value) => {
  const foundDomain = rowToShowDomains.find((domainEntry) => domainEntry.get('id') === domain.get('id'));
  const fields = await domain.get('governmentFields');
  const selectedFields = fields.filter((field) => field.selected);

  if (value) {
    foundDomain.set('selected', value);
  } else if (selectedFields.length === 1) {
    foundDomain.set('selected', value);
  }
};

export const getSelectedIseCodesWithFields = async(allIseCodesInApp, selectedFieldsByUser) => (await Promise.all(allIseCodesInApp.map((iseCode) => {
  const foundField = (selectedFieldsByUser.find((field) => field.get('id') === iseCode.get('field.id')));
  if (foundField) {
    return iseCode;
  }
}))).filter((iseCode) => iseCode);

/**
 * @name prepareMandateeRowAfterEdit
 * @description Maak een nieuwe mandateerow op basis van de doorgegeven aanpassingen in selectedMandatee
 * @param selectedMandatee De aanpassingen die we gedaan hebben in de UI aan de mandatee (nieuwe velden etc..)
 * @param mandateeRow De mandateerow die we willen aanpassen.
 * @returns newMandateeRow
 */
export const prepareMandateeRowAfterEdit = async(selectedMandatee, mandateeRow) => {
  const fields = await mandateeRow.get('fields');
  const domains = await mandateeRow.get('domains');

  const selectedDomains = [...new Set(domains.filter((domain) => domain.get('selected')))];
  const selectedFields = fields.filter((field) => field.get('selected'));
  const allIseCodes = await selectedMandatee.get('iseCodes');
  const filteredIseCodes = await getSelectedIseCodesWithFields(allIseCodes, selectedFields);

  const selectedEmployeePriority = await selectedMandatee.get('priority');
  const newMandateeRow = EmberObject.create({
    mandatee: selectedMandatee,
    mandateePriority: selectedEmployeePriority,
    fields: selectedFields,
    domains: selectedDomains,
    iseCodes: filteredIseCodes,
  });

  if (mandateeRow.get('isSubmitter')) {
    newMandateeRow.set('isSubmitter', true);
  }
  return newMandateeRow;
};
