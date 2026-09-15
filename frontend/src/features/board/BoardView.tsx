import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useUIStore } from '../../stores/useUIStore';
import { request } from '../../lib/api-client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getInitials } from '../../lib/utils';
import {
  Plus,
  Loader2,
  Kanban,
  Layers,
  Search,
  X,
  Bug,
  Bookmark,
  CheckSquare,
  Zap,
  ChevronUp,
  ChevronsUp,
  ChevronDown,
  Equal,
  ArrowRightLeft,
  AlertCircle,
} from 'lucide-react';

export const BoardView: React.FC = () => {
  const { activeOrgId, activeProjectId, members } = useWorkspaceStore();
  const { openModal, showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [filterText, setFilterText] = useState('');
  const [activeMoveMenuIssueId, setActiveMoveMenuIssueId] = useState<string | null>(null);

  // 1. Fetch Boards for current project
  const { data: boards = [], isLoading: isLoadingBoards } = useQuery<any[]>({
    queryKey: ['boards', activeOrgId, activeProjectId],
    queryFn: async () => {
      if (!activeOrgId || !activeProjectId) return [];
      const res = await request(`/organizations/${activeOrgId}/projects/${activeProjectId}/boards`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!activeOrgId && !!activeProjectId,
  });

  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const activeBoardId = selectedBoardId || boards[0]?.id;

  // 2. Fetch Board Columns & Issues
  const { data: boardData, isLoading: isLoadingBoardData } = useQuery<any>({
    queryKey: ['boardData', activeOrgId, activeProjectId, activeBoardId],
    queryFn: async () => {
      if (!activeOrgId || !activeProjectId || !activeBoardId) return null;
      return await request(
        `/organizations/${activeOrgId}/projects/${activeProjectId}/boards/${activeBoardId}`
      );
    },
    enabled: !!activeOrgId && !!activeProjectId && !!activeBoardId,
  });

  // 3. Move Issue Transition Mutation
  const moveIssueMutation = useMutation({
    mutationFn: async ({
      issueId,
      targetColName,
      version,
      transitionKey,
    }: {
      issueId: string;
      targetColName: string;
      version?: number;
      transitionKey?: string;
    }) => {
      return await request(`/organizations/${activeOrgId}/issues/${issueId}/transitions`, {
        method: 'POST',
        body: JSON.stringify({
          targetStatusName: targetColName,
          transitionKey,
          version,
        }),
      });
    },
    onSuccess: (_, variables) => {
      showToast(`Moved issue to ${variables.targetColName}`, 'success', 1500);
      setActiveMoveMenuIssueId(null);
      queryClient.invalidateQueries({ queryKey: ['boardData'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    onError: (err: any) => {
      showToast(`Failed to move: ${err.message}`, 'error');
      setActiveMoveMenuIssueId(null);
      queryClient.invalidateQueries({ queryKey: ['boardData'] });
    },
  });

  const columns: any[] = boardData?.columns || [];

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = columns.find((c) => c.id === source.droppableId);
    const destCol = columns.find((c) => c.id === destination.droppableId);
    if (!sourceCol || !destCol) return;

    const issue = sourceCol.issues?.find((i: any) => i.id === draggableId);
    if (!issue) return;

    // Optimistic local cache update
    queryClient.setQueryData(
      ['boardData', activeOrgId, activeProjectId, activeBoardId],
      (old: any) => {
        if (!old || !old.columns) return old;
        const newCols = old.columns.map((c: any) => {
          if (c.id === source.droppableId) {
            return { ...c, issues: (c.issues || []).filter((i: any) => i.id !== draggableId) };
          }
          if (c.id === destination.droppableId) {
            const nextIssues = [...(c.issues || [])];
            nextIssues.splice(destination.index, 0, { ...issue, status: destCol.name });
            return { ...c, issues: nextIssues };
          }
          return c;
        });
        return { ...old, columns: newCols };
      }
    );

    moveIssueMutation.mutate({
      issueId: draggableId,
      targetColName: destCol.name,
      version: issue.version,
    });
  };

  const handleQuickMove = (issue: any, targetColName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    moveIssueMutation.mutate({
      issueId: issue.id,
      targetColName,
      version: issue.version,
    });
  };

  const getColumnDotColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('progress') || lower.includes('doing')) return 'bg-blue-400 shadow-blue-500/50';
    if (lower.includes('review') || lower.includes('qa') || lower.includes('test')) return 'bg-amber-400 shadow-amber-500/50';
    if (lower.includes('done') || lower.includes('closed') || lower.includes('resolved')) return 'bg-emerald-400 shadow-emerald-500/50';
    return 'bg-slate-400 shadow-slate-500/50';
  };

  const renderIssueTypeIcon = (type?: string) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('bug')) return <span title="Bug" className="inline-flex items-center"><Bug className="w-3.5 h-3.5 text-rose-400 shrink-0" /></span>;
    if (lower.includes('story')) return <span title="User Story" className="inline-flex items-center"><Bookmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" /></span>;
    if (lower.includes('epic')) return <span title="Epic" className="inline-flex items-center"><Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" /></span>;
    return <span title="Task" className="inline-flex items-center"><CheckSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" /></span>;
  };

  const renderPriorityIcon = (priority?: string) => {
    const lower = (priority || '').toLowerCase();
    if (lower === 'highest') return <span title="Highest Priority" className="inline-flex items-center"><ChevronsUp className="w-3.5 h-3.5 text-rose-500 shrink-0" /></span>;
    if (lower === 'high') return <span title="High Priority" className="inline-flex items-center"><ChevronUp className="w-3.5 h-3.5 text-amber-400 shrink-0" /></span>;
    if (lower === 'low' || lower === 'lowest') return <span title="Low Priority" className="inline-flex items-center"><ChevronDown className="w-3.5 h-3.5 text-blue-400 shrink-0" /></span>;
    return <span title="Medium Priority" className="inline-flex items-center"><Equal className="w-3.5 h-3.5 text-slate-400 shrink-0" /></span>;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Board Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shadow-sm">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {boardData?.name || 'Project Board'}
              </h2>
              {boardData?.boardType && (
                <Badge variant="subtle" size="xs" className="uppercase font-mono tracking-wider">
                  {boardData.boardType}
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Real-time interactive finite-state Kanban board with drag-and-drop workflow transitions.
            </p>
          </div>
        </div>

        {/* Action Controls & Board Select */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {boards.length > 1 && (
            <select
              value={activeBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              className="bg-surface-surface text-xs font-semibold text-text-primary rounded-xl px-3 py-1.5 border border-border focus:border-brand-500 shadow-sm"
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.boardType || 'kanban'})
                </option>
              ))}
            </select>
          )}

          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter board..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-8 pr-7 py-1.5 text-xs bg-surface-surface text-text-primary placeholder:text-text-muted rounded-xl border border-border/80 focus:border-brand-500 focus:outline-none w-36 sm:w-48 transition-all shadow-inner"
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Create Issue Trigger */}
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => openModal('createIssue')}
            className="shadow-glow font-semibold"
          >
            Create Issue
          </Button>
        </div>
      </div>

      {/* Main Board Container */}
      {isLoadingBoards || isLoadingBoardData ? (
        <div className="flex items-center justify-center py-28 text-text-muted gap-2.5">
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
          <span className="text-sm font-medium">Loading project board data...</span>
        </div>
      ) : columns.length === 0 ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl p-12 text-center space-y-3 shadow-card">
          <Layers className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="text-base font-semibold text-white">No Board Columns Configured</h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            This project does not have columns configured yet. You can create issues or add columns in project settings.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => openModal('createIssue')}
          >
            Create First Issue
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 items-start min-h-[calc(100vh-240px)] custom-scrollbar">
            {columns.map((column) => {
              const filteredIssues = (column.issues || []).filter((i: any) => {
                if (!filterText.trim()) return true;
                const search = filterText.toLowerCase();
                return (
                  i.key?.toLowerCase().includes(search) ||
                  (i.title || i.summary || '').toLowerCase().includes(search)
                );
              });

              const isOverWip = Boolean(column.wipLimit && filteredIssues.length > column.wipLimit);

              return (
                <div
                  key={column.id}
                  className="w-80 shrink-0 bg-surface-surface/90 border border-border/80 rounded-2xl flex flex-col max-h-[calc(100vh-230px)] shadow-card"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-border/70 flex items-center justify-between bg-surface-elevated/50 rounded-t-2xl">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${getColumnDotColor(column.name)}`} />
                      <span className="text-xs font-bold text-text-primary tracking-wide uppercase">
                        {column.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border transition-colors ${
                          isOverWip
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            : 'bg-surface-hover text-text-secondary border-border/60'
                        }`}
                        title={isOverWip ? `WIP limit exceeded: ${filteredIssues.length} / ${column.wipLimit}` : undefined}
                      >
                        {filteredIssues.length}
                        {column.wipLimit ? ` / ${column.wipLimit}` : ''}
                      </span>
                      {isOverWip && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                    </div>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-2.5 overflow-y-auto flex-1 space-y-2.5 transition-colors rounded-b-2xl custom-scrollbar ${
                          snapshot.isDraggingOver ? 'bg-brand-500/10 ring-2 ring-brand-500/30 ring-inset' : ''
                        }`}
                      >
                        {filteredIssues.map((issue: any, index: number) => {
                          const isMoveMenuOpen = activeMoveMenuIssueId === issue.id;

                          return (
                            <Draggable key={issue.id} draggableId={issue.id} index={index}>
                              {(dragProvided, dragSnapshot) => {
                                const cardContent = (
                                  <div
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    onClick={() => openModal('issueDetail', issue)}
                                    style={{
                                      ...dragProvided.draggableProps.style,
                                      width: dragSnapshot.isDragging ? 300 : undefined,
                                    }}
                                    className={`group relative p-3.5 rounded-xl border bg-surface-card cursor-pointer space-y-2.5 select-none ${
                                      dragSnapshot.isDragging
                                        ? 'shadow-2xl border-brand-500 ring-2 ring-brand-500/50 z-[99999] opacity-95 pointer-events-auto'
                                        : 'border-white/5 shadow-card hover:border-brand-500/40 hover:-translate-y-0.5 hover:bg-surface-hover/80 transition-all duration-150'
                                    }`}
                                  >
                                    {/* Top Bar: Issue Key, Type Icon, Priority & Quick Move */}
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5">
                                        {renderIssueTypeIcon(issue.issueType || issue.type)}
                                        <span className="font-mono text-[11px] font-bold text-brand-400 group-hover:text-brand-300 transition-colors">
                                          {issue.key}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {renderPriorityIcon(issue.priority)}

                                        {/* Quick Move Trigger */}
                                        <div className="relative">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveMoveMenuIssueId(isMoveMenuOpen ? null : issue.id);
                                            }}
                                            title="Quick move to column"
                                            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors opacity-0 group-hover:opacity-100"
                                          >
                                            <ArrowRightLeft className="w-3 h-3" />
                                          </button>

                                          {/* Quick Move Popover Menu */}
                                          {isMoveMenuOpen && (
                                            <div
                                              className="absolute right-0 top-6 w-44 rounded-xl bg-surface-card border border-border/90 shadow-dropdown py-1 z-50 animate-slide-up"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <div className="px-2.5 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border/60">
                                                Move to status
                                              </div>
                                              {columns
                                                .filter((c) => c.id !== column.id)
                                                .map((targetCol) => (
                                                  <button
                                                    key={targetCol.id}
                                                    type="button"
                                                    onClick={(e) => handleQuickMove(issue, targetCol.name, e)}
                                                    className="w-full text-left px-2.5 py-1.5 text-xs text-text-primary hover:bg-brand-500/15 hover:text-brand-300 flex items-center justify-between transition-colors"
                                                  >
                                                    <span className="truncate">{targetCol.name}</span>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${getColumnDotColor(targetCol.name)}`} />
                                                  </button>
                                                ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Title / Summary */}
                                    <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-relaxed tracking-tight group-hover:text-white transition-colors">
                                      {issue.title || issue.summary}
                                    </p>

                                    {/* Bottom Info: Story Points, Sprint, Assignee Avatar */}
                                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-text-muted">
                                      <div className="flex items-center gap-1.5">
                                        {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                                          <span className="px-1.5 py-0.5 rounded bg-surface-elevated/70 border border-white/5 text-[10px] font-mono font-semibold text-text-secondary">
                                            {issue.storyPoints} pts
                                          </span>
                                        )}
                                        {issue.sprint && (
                                          <span className="truncate max-w-[80px] text-text-muted">
                                            {issue.sprint.name || 'Sprint'}
                                          </span>
                                        )}
                                      </div>

                                      {/* Assignee Avatar */}
                                      {(() => {
                                        const assignee =
                                          issue.assignee ||
                                          issue.assigneeMember ||
                                          members.find(
                                            (m) =>
                                              m.id === issue.assigneeMemberId ||
                                              m.id === issue.assigneeId
                                          );
                                        return assignee ? (
                                          <div
                                            className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center text-[9px] shadow-sm ring-1 ring-white/10"
                                            title={assignee.fullName || assignee.user?.fullName || assignee.email || assignee.user?.email}
                                          >
                                            {getInitials(
                                              assignee.fullName || assignee.user?.fullName,
                                              assignee.email || assignee.user?.email
                                            )}
                                          </div>
                                        ) : (
                                          <span className="italic text-[10px] text-text-muted hover:text-text-secondary">
                                            Unassigned
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                );

                                if (dragSnapshot.isDragging) {
                                  return createPortal(cardContent, document.body);
                                }
                                return cardContent;
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {filteredIssues.length === 0 && !snapshot.isDraggingOver && (
                          <div className="py-10 text-center text-xs text-text-muted italic flex flex-col items-center justify-center gap-1">
                            <span>No cards in this column</span>
                            <span className="text-[10px] text-text-muted/60">Drag cards here</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};
