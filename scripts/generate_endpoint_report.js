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

const report = [];

controllers.forEach(ctrlFile => {
  const content = fs.readFileSync(ctrlFile, 'utf8');
  const ctrlMatch = content.match(/@Controller\((['"](.*?)['"])?\)/);
  const basePrefix = (ctrlMatch && ctrlMatch[2]) ? ctrlMatch[2].replace(/^\/|\/$/g, '') : '';
  const lines = content.split('\n');

  const ctrlInfo = {
    file: ctrlFile,
    name: path.basename(ctrlFile),
    basePrefix,
    endpoints: []
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/@(Get|Post|Put|Patch|Delete)\((?:['"](.*?)['"])?\)/i);
    if (match) {
      const method = match[1].toUpperCase();
      const subPath = (match[2] || '').replace(/^\/|\/$/g, '');
      const fullPath = '/' + [basePrefix, subPath].filter(Boolean).join('/');

      // Collect decorators and method signature
      let signature = '';
      for (let j = i; j < Math.min(i + 6, lines.length); j++) {
        signature += ' ' + lines[j].trim();
        if (lines[j].includes('(') && lines[j].includes('{') || lines[j].includes(');')) {
          break;
        }
      }

      ctrlInfo.endpoints.push({
        method,
        fullPath,
        signature: signature.trim()
      });
    }
  }
  report.push(ctrlInfo);
});

fs.writeFileSync('scripts/endpoints_full_report.json', JSON.stringify(report, null, 2));
console.log('Successfully wrote endpoints_full_report.json with ' + report.reduce((acc, c) => acc + c.endpoints.length, 0) + ' endpoints across ' + report.length + ' controllers.');
