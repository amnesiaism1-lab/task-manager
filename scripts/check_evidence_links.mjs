import fs from 'fs';

const md = fs.readFileSync('docs/TEST_CASE_EXECUTION_EVIDENCE_FULL.md', 'utf8');
const regex = /!\[.*?\]\((evidence_tc\/.*?)\)/g;
let match;
let missing = [];
let found = 0;
while ((match = regex.exec(md)) !== null) {
  const file = 'docs/' + match[1];
  if (fs.existsSync(file)) {
    found++;
  } else {
    missing.push(match[1]);
  }
}
console.log(`Found existing images: ${found}, Missing: ${missing.length}`);
if (missing.length > 0) {
  console.log('Missing images:', missing);
}
