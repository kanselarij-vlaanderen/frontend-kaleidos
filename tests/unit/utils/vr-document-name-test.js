import VRDocumentName from 'fe-redpencil/utils/vr-document-name';
import { module, test } from 'qunit';

module('Unit | Utility | vr-document-name', () => {
  const name = 'VR 2019 1511 MED.0377/19TER';
  const result = new VRDocumentName(name, { strict: true });

  test('its parsing strictness parses correctly', (assert) => {
    assert.strictEqual(result.strict, true);
  });

  test('its name property pagets instantiated correctly', (assert) => {
    assert.strictEqual(result.name, name);
  });

  test('it is valid', (assert) => {
    assert.ok(result.isValid);
  });

  test('its year parses correctly', (assert) => {
    assert.strictEqual(result.parseMeta().date.getFullYear(), 2019);
  });

  test('its month parses correctly', (assert) => {
    assert.strictEqual(result.parseMeta().date.getMonth() + 1, 11);
  });

  test('its day of the month parses correctly', (assert) => {
    assert.strictEqual(result.parseMeta().date.getDate(), 15);
  });

  test('its document type parses correctly', (assert) => {
    assert.strictEqual(result.parseMeta().docType, 'MED');
  });

  test('its case number parses correctly', (assert) => {
    assert.strictEqual(result.parseMeta().caseNr, 377);
  });

  test('its index parses correctly', (assert) => {
    assert.strictEqual(result.parseMeta().index, 19);
  });
});
