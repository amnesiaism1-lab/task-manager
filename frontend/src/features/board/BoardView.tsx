import React, { useState } from 'react';
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
} from 'lucide-react';

export const BoardView: React.FC = () => {
  const { activeOrgId, activeProjectId, projects } = useWorkspaceStore();
  const { openModal, showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [filterText, setFilterText] = useState('');

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
      queryClient.invalidateQueries({ queryKey: ['boardData'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    onError: (err: any) => {
      showToast(`Failed to move: ${err.message}`, 'error');
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
        if (!old) return old;
        const newCols = old.columns.map((col: any) => {
          if (col.id === source.droppableId) {
            return {
              ...col,
              issues: col.issues.filter((i: any) => i.id !== draggableId),
            };
          }
          if (col.id === destination.droppableId) {
            const movedIssue = { ...issue, status: destCol.name };
            const newIssues = Array.from(col.issues || []);
            newIssues.splice(destination.index, 0, movedIssue);
            return {
              ...col,
              issues: newIssues,
            };
          }
          return col;
        });
        return { ...old, columns: newCols };
      }
    );

    // Call server transition
    const matchingTrans = (issue.transitions || []).find((t: any) =>
      t.name.toLowerCase().includes(destCol.name.toLowerCase()) ||
      destCol.name.toLowerCase().includes(t.name.toLowerCase())
    );

    moveIssueMutation.mutate({
      issueId: issue.id,
      targetColName: destCol.name,
      version: issue.version,
      transitionKey: matchingTrans?.key,
    });
  };

  const currentProject = projects.find((p) => p.id === activeProjectId);

  return (
    <div className="space-y-6">
      {/* Board Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-border/80 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-sm">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {boards.length > 1 ? (
                <select
                  value={activeBoardId}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
                  className="bg-surface-surface text-sm font-bold text-white rounded px-2 py-1 border border-border outline-none cursor-pointer"
                >
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {boardData?.name || currentProject?.name || 'Agile Board'}
                </h1>
              )}
              <Badge variant="todo" size="xs">
                {boardData?.type?.toUpperCase() || 'KANBAN'}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary">
              Project: <span className="font-semibold text-text-primary">{currentProject?.name}</span> ({currentProject?.key})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Issue Filter input */}
          <input
            type="text"
            placeholder="Filter cards..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-surface-surface text-xs rounded-lg px-3 py-1.5 border border-border focus:border-brand-500 focus:outline-none w-40 sm:w-48"
          />

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => openModal('createIssue')}
            className="shadow-glow font-semibold"
          >
            New Issue
          </Button>
        </div>
      </div>

      {/* Kanban Drag and Drop Columns Container */}
      {isLoadingBoards || isLoadingBoardData ? (
        <div className="flex items-center justify-center py-24 text-text-muted gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
          <span className="text-sm">Loading board data...</span>
        </div>
      ) : columns.length === 0 ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl p-12 text-center space-y-3">
          <Layers className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="text-base font-semibold text-white">No Board Columns Found</h3>
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
          <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[calc(100vh-250px)]">
            {columns.map((column) => {
              const filteredIssues = (column.issues || []).filter((i: any) => {
                if (!filterText.trim()) return true;
                const search = filterText.toLowerCase();
                return (
                  i.key?.toLowerCase().includes(search) ||
                  (i.title || i.summary || '').toLowerCase().includes(search)
                );
              });

              return (
                <div
                  key={column.id}
                  className="w-80 shrink-0 bg-surface-surface/60 border border-border/80 rounded-2xl flex flex-col max-h-[calc(100vh-240px)] shadow-sm"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-border/70 flex items-center justify-between bg-surface-elevated/40 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary tracking-wide">
                        {column.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-surface-hover text-text-secondary border border-border/60">
                        {filteredIssues.length}
                        {column.wipLimit ? ` / ${column.wipLimit}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-2.5 overflow-y-auto flex-1 space-y-2.5 transition-colors rounded-b-2xl ${
                          snapshot.isDraggingOver ? 'bg-brand-500/5' : ''
                        }`}
                      >
                        {filteredIssues.map((issue: any, index: number) => (
                          <Draggable key={issue.id} draggableId={issue.id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => openModal('issueDetail', issue)}
                                className={`p-3.5 rounded-xl border bg-surface-card hover:bg-surface-hover/80 cursor-pointer transition-all duration-150 space-y-2 select-none ${
                                  dragSnapshot.isDragging
                                    ? 'shadow-modal border-brand-500 ring-2 ring-brand-500/30 scale-[1.02]'
                                    : 'border-border/80 shadow-sm hover:border-border'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[11px] font-bold text-brand-400">
                                    {issue.key}
                                  </span>
                                  <Badge
                                    variant={
                                      (issue.priority || '').toLowerCase() === 'high' ||
                                      (issue.priority || '').toLowerCase() === 'highest'
                                        ? 'danger'
                                        : 'default'
                                    }
                                    size="xs"
                                  >
                                    {issue.priority || 'Medium'}
                                  </Badge>
                                </div>

                                <p className="text-xs font-medium text-text-primary line-clamp-2 leading-snug">
                                  {issue.title || issue.summary}
                                </p>

                                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-text-muted">
                                  <span>{issue.issueType || issue.type || 'Task'}</span>
                                  {issue.assignee || issue.assigneeMember ? (
                                    <div className="w-5 h-5 rounded-full bg-brand-600/40 font-bold text-white flex items-center justify-center text-[9px]">
                                      {getInitials(
                                        issue.assignee?.fullName || issue.assigneeMember?.fullName,
                                        issue.assignee?.email
                                      )}
                                    </div>
                                  ) : (
                                    <span className="italic">Unassigned</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {filteredIssues.length === 0 && !snapshot.isDraggingOver && (
                          <div className="py-8 text-center text-xs text-text-muted italic">
                            No cards in this column
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
