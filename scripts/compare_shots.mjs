import fs from 'fs';

const captureScript = fs.readFileSync('scripts/capture_real_ui_evidence.mjs', 'utf8');
const md = fs.readFileSync('docs/TEST_CASE_EXECUTION_EVIDENCE_FULL.md', 'utf8');

const shotRegex = /shot\('([^']+)'\)/g;
const mdRegex = /!\[.*?\]\(evidence_tc\/([^)]+)\)/g;

const scriptShots = [];
let m;
while ((m = shotRegex.exec(captureScript)) !== null) {
  scriptShots.push(m[1]);
}

const mdShots = [];
while ((m = mdRegex.exec(md)) !== null) {
  mdShots.push(m[1]);
}

console.log(`Script shots count: ${scriptShots.length}`);
console.log(`MD shots count: ${mdShots.length}`);

for (let i = 0; i < Math.min(scriptShots.length, mdShots.length); i++) {
  if (scriptShots[i] !== mdShots[i]) {
    console.log(`Mismatch at index ${i + 1}:`);
    console.log(`  MD has:     ${mdShots[i]}`);
    console.log(`  Script has: ${scriptShots[i]}`);
  }
}
