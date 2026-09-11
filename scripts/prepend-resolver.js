const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../backend/dist/main.js');
if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  const resolverCode = `// Prepend module search paths for Vercel Serverless environment
const _path = require('path');
const _fs = require('fs');
[
  _path.join(__dirname, 'node_modules'),
  _path.join(__dirname, '..', 'node_modules'),
  _path.join(__dirname, '..', 'backend', 'node_modules'),
  _path.join(process.cwd(), 'node_modules'),
  _path.join(process.cwd(), 'backend', 'node_modules'),
  '/var/task/node_modules',
  '/var/task/backend/node_modules'
].forEach(p => {
  if (_fs.existsSync(p) && !module.paths.includes(p)) {
    module.paths.unshift(p);
  }
});
`;

  if (!content.includes('// Prepend module search paths')) {
    content = resolverCode + content;
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('✓ Successfully prepended module search paths to backend/dist/main.js');
  }
} else {
  console.warn('! Target file not found for prepend: ' + targetFile);
}
