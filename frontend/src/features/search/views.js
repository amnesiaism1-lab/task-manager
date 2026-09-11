export function workView(state, escapeHtml) {
  return `<section class="hero"><div><p class="eyebrow warm">TODAY'S CONTROL ROOM</p><h2>See the work. Move the work.</h2><p class="muted">Search issues across your project, save the views your team repeats, and keep every handoff visible.</p></div><div class="hero-stat"><strong>${state.issues.length}</strong><span>visible issues</span></div></section>
    <section class="toolbar"><div class="search-wrap"><span>⌕</span><input id="search" value="${escapeHtml(state.query)}" placeholder="Search summary or key" aria-label="Search issues" /><kbd>⌘ K</kbd></div><button class="button primary" id="run-search">Run search</button><button class="button ghost" id="new-issue">New issue</button><button class="button ghost" id="save-filter">Save view</button></section>
    ${state.error ? `<div class="notice error">${escapeHtml(state.error)}</div>` : ''}
    <section class="content-grid"><div class="panel issues-panel"><div class="panel-heading"><div><p class="eyebrow">ISSUE STREAM</p><h3>Recent work</h3></div><button class="icon-button" id="refresh" title="Refresh issues">↻</button></div><div class="table-head"><span>Issue</span><span>Summary</span><span>State</span><span>Updated</span></div><div id="issues">${issueRows(state, escapeHtml)}</div></div><aside class="side-stack"><div class="panel"><div class="panel-heading"><div><p class="eyebrow">PERSONAL VIEWS</p><h3>Saved filters</h3></div><span class="count">${state.filters.length}</span></div>${filterRows(state, escapeHtml)}</div><div class="panel protocol"><p class="eyebrow">QUERY AST</p><h3>Power search, safely.</h3><p class="muted">Use structured filters without interpolating raw SQL.</p><code>{ "and": [{ "field": "status", "value": "done" }] }</code></div></aside></section>`;
}

export function filtersView(state, escapeHtml) {
  return `<section class="page-heading"><p class="eyebrow warm">FILTER LIBRARY</p><h2>Views that stay useful.</h2><p class="muted">Saved queries remain scoped to your current permissions every time they run.</p></section><section class="panel wide-panel"><div class="panel-heading"><div><p class="eyebrow">SAVED FILTERS</p><h3>Personal and shared views</h3></div><button class="button primary" id="save-filter">New view</button></div><div class="filter-library">${filterRows(state, escapeHtml)}</div></section>`;
}

function issueRows(state, escapeHtml) {
  if (!state.issues.length) return '<div class="empty">Connect a workspace, then run a search to bring the board alive.</div>';
  return state.issues.map((issue) => `<button class="table-row issue-row" data-issue="${escapeHtml(issue.id)}"><span class="issue-key">${escapeHtml(issue.key || 'ISSUE')}</span><strong>${escapeHtml(issue.summary)}</strong><span class="pill">${escapeHtml(issue.state?.name || issue.status || 'Open')}</span><time>${issue.updatedAt ? new Date(issue.updatedAt).toLocaleDateString() : '—'}</time></button>`).join('');
}

function filterRows(state, escapeHtml) {
  if (!state.filters.length) return '<div class="empty compact">No saved views yet.</div>';
  return state.filters.map((filter) => `<button class="filter-row" data-filter="${escapeHtml(filter.id)}"><span class="filter-icon">◌</span><span><strong>${escapeHtml(filter.name)}</strong><small>v${filter.version} · ${escapeHtml(filter.queryLanguage)}</small></span><span>›</span></button>`).join('');
}
