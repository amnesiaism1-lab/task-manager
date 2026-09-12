import fs from 'fs';
import path from 'path';

function findFiles(dir, filter, list = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      findFiles(full, filter, list);
    } else if (filter(full)) {
      list.push(full);
    }
  }
  return list;
}

const controllers = findFiles('backend/src', f => f.endsWith('.controller.ts') || f.endsWith('health.module.ts'));

const allEndpoints = [];

for (const file of controllers) {
  const content = fs.readFileSync(file, 'utf8');
  const ctrlMatch = content.match(/@Controller\((?:['"`]([^'"`]*)['"`])?\)/);
  const basePath = ctrlMatch ? ctrlMatch[1] || '' : '';
  const lines = content.split(/\r?\n/);
  

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const methodMatch = line.match(/@(Get|Post|Patch|Delete|Put)\((?:['"`]([^'"`]*)['"`])?\)/);
    if (methodMatch) {
      const httpMethod = methodMatch[1].toUpperCase();
      const subPath = methodMatch[2] || '';
      // Look for handler name on same or next lines
      let handler = 'handler';
      const handlerMatch = line.match(/(?:async\s+)?([a-zA-Z0-9_$]+)\s*\(/);
      if (handlerMatch && !['Get','Post','Patch','Delete','Put','UseGuards','RequirePermissions'].includes(handlerMatch[1])) {
        handler = handlerMatch[1];
      } else {
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const nextMatch = lines[j].match(/(?:async\s+)?([a-zA-Z0-9_$]+)\s*\(/);
          if (nextMatch && !['Get','Post','Patch','Delete','Put','UseGuards','RequirePermissions'].includes(nextMatch[1])) {
            handler = nextMatch[1];
            break;
          }
        }
      }

      const fullPath = ('/api/' + basePath + (subPath ? '/' + subPath : '')).replace(/\/+/g, '/').replace(/\/$/, '');
      allEndpoints.push({
        file: path.basename(file),
        httpMethod,
        basePath,
        subPath,
        fullPath: fullPath.startsWith('/api') ? fullPath : '/api' + fullPath,
        handler
      });
    }
  }
}

console.log(`Found ${allEndpoints.length} total endpoints across ${controllers.length} controller files:\n`);
allEndpoints.forEach(e => {
  console.log(`${e.httpMethod.padEnd(7)} ${e.fullPath.padEnd(65)} (${e.file} -> ${e.handler})`);
});

fs.writeFileSync('scratch/all_endpoints.json', JSON.stringify(allEndpoints, null, 2));
