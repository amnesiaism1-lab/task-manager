import fs from 'fs';
import crypto from 'crypto';

const md = fs.readFileSync('docs/TEST_CASE_EXECUTION_EVIDENCE_FULL.md', 'utf8');
const regex = /!\[.*?\]\((evidence_tc\/.*?)\)/g;
let match;
const seenHashes = new Map();
let duplicates = [];
let total = 0;

while ((match = regex.exec(md)) !== null) {
  total++;
  const filePath = 'docs/' + match[1];
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  if (seenHashes.has(hash)) {
    duplicates.push({ file1: seenHashes.get(hash), file2: match[1], hash });
  } else {
    seenHashes.set(hash, match[1]);
  }
}

console.log(`Total checked: ${total}`);
console.log(`Unique hashes: ${seenHashes.size}`);
console.log(`Duplicate count: ${duplicates.length}`);
if (duplicates.length > 0) {
  console.log('Duplicates found:', duplicates);
}
