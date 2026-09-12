const fs = require('fs');
const path = require('path');

const controllers = [
  'backend/src/app.controller.ts',
  'backend/src/modules/admin/admin.controller.ts',
  'backend/src/modules/audit/audit.controller.ts',
  'backend/src/modules/auth/api-token.controller.ts',
  'backend/src/modules/auth/auth.controller.ts',
  'backend/src/modules/automation/automation.controller.ts',
  'backend/src/modules/board/board.controller.ts',
  'backend/src/modules/catalog/catalog.controller.ts',
  'backend/src/modules/custom-field/custom-field.controller.ts',
  'backend/src/modules/issue/attachment.controller.ts',
  'backend/src/modules/issue/issue.controller.ts',
  'backend/src/modules/job/job.controller.ts',
  'backend/src/modules/notification/notification.controller.ts',
  'backend/src/modules/organization/organization.controller.ts',
  'backend/src/modules/productivity/dashboard.controller.ts',
  'backend/src/modules/project/project.controller.ts',
  'backend/src/modules/search/issue-search.controller.ts',
  'backend/src/modules/search/saved-filter.controller.ts',
  'backend/src/modules/sprint/sprint.controller.ts',
  'backend/src/modules/webhook/webhook.controller.ts',
  'backend/src/modules/workflow/workflow.controller.ts',
  'backend/src/modules/workspace/workspace.controller.ts'
];

let totalEndpoints = 0;
const results = [];

controllers.forEach(ctrl => {
  const content = fs.readFileSync(ctrl, 'utf-8');
  const ctrlPrefixMatch = content.match(/@Controller\(['"]?(.*?)['"]?\)/);
  const prefix = ctrlPrefixMatch ? ctrlPrefixMatch[1].replace(/^\/|\/$/g, '') : '';
  const lines = content.split('\n');
  const ctrlObj = { controller: path.basename(ctrl), prefix, endpoints: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const methodMatch = line.match(/@(Get|Post|Put|Patch|Delete)\((?:['"](.*?)['"])?\)/i);
    if (methodMatch) {
      totalEndpoints++;
      const httpMethod = methodMatch[1].toUpperCase();
      const subPath = (methodMatch[2] || '').replace(/^\/|\/$/g, '');
      const fullPath = '/' + [prefix, subPath].filter(Boolean).join('/');
      
      // Look forward for method name
      let methodName = '';
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const fnMatch = lines[j].match(/(?:async\s+)?([a-zA-Z0-9_]+)\s*\(/);
        if (fnMatch && !lines[j].includes('@')) {
          methodName = fnMatch[1];
          break;
        }
      }
      ctrlObj.endpoints.push({ httpMethod, fullPath, methodName });
    }
  }
  results.push(ctrlObj);
});

console.log(`TOTAL ENDPOINTS DETECTED: ${totalEndpoints}`);
results.forEach(c => {
  console.log(`\n=== ${c.controller} (Base: /${c.prefix}) [${c.endpoints.length} endpoints] ===`);
  c.endpoints.forEach(e => {
    console.log(`  ${e.httpMethod.padEnd(7)} ${e.fullPath.padEnd(50)} -> ${e.methodName}()`);
  });
});
