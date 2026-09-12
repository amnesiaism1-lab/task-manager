import fs from 'fs';

const md = fs.readFileSync('docs/TEST_CASE_EXECUTION_EVIDENCE_FULL.md', 'utf8');
const regex = /!\[.*?\]\((evidence_tc\/.*?)\)/g;
const valid = new Set();
let match;
while ((match = regex.exec(md)) !== null) {
  valid.add(match[1].replace('evidence_tc/', ''));
}

const all = fs.readdirSync('docs/evidence_tc');
let removed = 0;
for (const f of all) {
  if (!valid.has(f)) {
    console.log('Removing obsolete file:', f);
    fs.unlinkSync('docs/evidence_tc/' + f);
    removed++;
  }
}

console.log(`Active in MD: ${valid.size}, Obsolete removed: ${removed}, Files in folder: ${fs.readdirSync('docs/evidence_tc').length}`);
