import VrNotulenName, { compareFunction } from 'frontend-kaleidos/utils/vr-notulen-name';
import { module, test } from 'qunit';

module('Unit | Utility | vr-notulen-name', function() {

  // test('For a valid name, should instantiate without throwing', function(assert) {
  //   const name = 'VR PV 2021/26'
  //   assert.doesNotThrow( // Not supported in qunit
  //     () => {
  //       new VrNotulenName(name);
  //     }
  //   );
  // });

  test('Should consider a valid name as valid', function(assert) {
    const name = 'VR PV 2021/26'
    const nameObject = new VrNotulenName(name);
    assert.true(nameObject.isValid);
  });

  test('Should parse the different name parts correctly', function(assert) {
    const name = 'VR PV 2021/26BIS'
    const nameObject = new VrNotulenName(name);
    const nameMetadata = nameObject.parseMeta();
    assert.strictEqual(nameMetadata.year, 2021);
    assert.strictEqual(nameMetadata.sessionNr, 26);
    assert.strictEqual(nameMetadata.versionSuffix, 'BIS');
    assert.strictEqual(nameMetadata.versionNumber, 2);
  });

  test('Should sort names correctly', function(assert) {
    const names = [
      'VR PV 2021/26BIS',
      'VR PV 2021/27',
      'VR PV 2021/26',
      'VR PV 2022/28',
      'VR PV 2021/28'
    ];
    names.sort((nameA, nameB) => compareFunction(new VrNotulenName(nameA), new VrNotulenName(nameB)));
    assert.strictEqual(names[0], 'VR PV 2021/26');
    assert.strictEqual(names[1], 'VR PV 2021/26BIS');
    assert.strictEqual(names[2], 'VR PV 2021/27');
    assert.strictEqual(names[3], 'VR PV 2021/28');
    assert.strictEqual(names[4], 'VR PV 2022/28');
  });
});
