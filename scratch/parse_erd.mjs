import fs from 'fs';

const content = fs.readFileSync('TASK_MANAGER_ERD.puml', 'utf8');
const lines = content.split(/\r?\n/);

let currentPkg = 'Root';
const packages = {};

for (const line of lines) {
  const pkgMatch = line.match(/^\s*package\s+"([^"]+)"/);
  if (pkgMatch) {
    currentPkg = pkgMatch[1];
    packages[currentPkg] = [];
    continue;
  }
  const entityMatch = line.match(/^\s*entity\s+"([^"]+)"/);
  if (entityMatch) {
    if (!packages[currentPkg]) packages[currentPkg] = [];
    packages[currentPkg].push(entityMatch[1]);
  }
}

let total = 0;
for (const [pkg, entities] of Object.entries(packages)) {
  console.log(`\n📦 Package: ${pkg} (${entities.length} entities)`);
  entities.forEach(e => console.log(`   - ${e}`));
  total += entities.length;
}
console.log(`\nTotal Entities: ${total}`);
