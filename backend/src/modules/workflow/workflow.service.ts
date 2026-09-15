import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from '../../database/entities/workflow/workflow.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { WorkflowTransition } from '../../database/entities/workflow/workflow-transition.entity';
import { WorkflowTransitionGuard } from '../../database/entities/workflow/workflow-transition-guard.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import {
  CreateGuardDto,
  CreateWorkflowDto,
  CreateStateDto,
  UpdateStateDto,
  CreateTransitionDto,
  UpdateTransitionDto,
} from './dto/workflow.dto';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow) private readonly workflows: Repository<Workflow>,
    @InjectRepository(WorkflowState) private readonly states: Repository<WorkflowState>,
    @InjectRepository(WorkflowTransition) private readonly transitions: Repository<WorkflowTransition>,
    @InjectRepository(WorkflowTransitionGuard) private readonly guards: Repository<WorkflowTransitionGuard>,
  ) {}

  list(orgId: string) { return this.workflows.find({ where: { orgId }, order: { key: 'ASC', version: 'DESC' } }); }

  async detail(orgId: string, workflowId: string) {
    const workflow = await this.workflows.findOne({ where: { id: workflowId, orgId } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    const states = await this.states.find({ where: { workflowId }, order: { position: 'ASC' } });
    const transitions = await this.transitions.find({ where: { workflowId }, order: { sortOrder: 'ASC' } });
    return { workflow, states, transitions };
  }

  async create(orgId: string, input: CreateWorkflowDto) {
    if (await this.workflows.exists({ where: { orgId, key: input.key.trim().toLowerCase(), isActive: true } })) throw new ConflictException('Active workflow key already exists');
    return this.workflows.save(this.workflows.create({ orgId, key: input.key.trim().toLowerCase(), name: input.name.trim(), version: 1, isActive: true }));
  }

  async addGuard(orgId: string, input: CreateGuardDto) {
    const transition = await this.transitions.createQueryBuilder('transition')
      .innerJoin(Workflow, 'workflow', 'workflow.id = transition.workflow_id')
      .where('transition.id = :transitionId AND workflow.org_id = :orgId', { transitionId: input.transitionId, orgId }).getOne();
    if (!transition) throw new NotFoundException('Transition not found');
    if (input.configJson === null || Array.isArray(input.configJson)) throw new ConflictException('Guard config must be a JSON object');
    return this.guards.save(this.guards.create({ transitionId: input.transitionId, guardType: input.guardType, configJson: input.configJson }));
  }

  // --- States Management ---
  async createState(orgId: string, workflowId: string, input: CreateStateDto) {
    const workflow = await this.workflows.findOne({ where: { id: workflowId, orgId } });
    if (!workflow) throw new NotFoundException('Workflow not found');

    const key = input.key.trim().toLowerCase();
    const existing = await this.states.findOne({ where: { workflowId, key } });
    if (existing) throw new ConflictException(`Workflow state with key '${key}' already exists in this workflow`);

    if (input.isInitial) {
      await this.states.update({ workflowId }, { isInitial: false });
    }

    const state = this.states.create({
      workflowId,
      key,
      name: input.name.trim(),
      category: input.category,
      isInitial: input.isInitial ?? false,
      isTerminal: input.isTerminal ?? false,
      position: input.position ?? 0,
    });

    return this.states.save(state);
  }

  async updateState(orgId: string, workflowId: string, stateId: string, input: UpdateStateDto) {
    const workflow = await this.workflows.findOne({ where: { id: workflowId, orgId } });
    if (!workflow) throw new NotFoundException('Workflow not found');

    const state = await this.states.findOne({ where: { id: stateId, workflowId } });
    if (!state) throw new NotFoundException('Workflow state not found');

    if (input.isInitial) {
      await this.states.update({ workflowId }, { isInitial: false });
    }

    if (input.key !== undefined) state.key = input.key.trim().toLowerCase();
    if (input.name !== undefined) state.name = input.name.trim();
    if (input.category !== undefined) state.category = input.category;
    if (input.isInitial !== undefined) state.isInitial = input.isInitial;
    if (input.isTerminal !== undefined) state.isTerminal = input.isTerminal;
    if (input.position !== undefined) state.position = input.position;

    return this.states.save(state);
  }

  async deleteState(orgId: string, workflowId: string, stateId: string) {
    const workflow = await this.workflows.findOne({ where: { id: workflowId, orgId } });
    if (!workflow) throw new NotFoundException('Workflow not found');

    const state = await this.states.findOne({ where: { id: stateId, workflowId } });
    if (!state) throw new NotFoundException('Workflow state not found');

    const inUse = await this.states.manager.count(Issue, { where: { stateId } });
    if (inUse > 0) throw new ConflictException(`Cannot delete state '${state.name}' because ${inUse} issue(s) are currently in this state`);

    // Remove transitions referencing this state
    await this.transitions.delete({ fromStateId: stateId });
    await this.transitions.delete({ toStateId: stateId });

    await this.states.delete(stateId);
    return { success: true };
  }

  // --- Transitions Management ---
  async createTransition(orgId: string, workflowId: string, input: CreateTransitionDto) {
    const workflow = await this.workflows.findOne({ where: { id: workflowId, orgId } });
    if (!workflow) throw new NotFoundException('Workflow not found');

    const fromState = await this.states.findOne({ where: { id: input.fromStateId, workflowId } });
    if (!fromState) throw new NotFoundException('Source state (fromStateId) not found in this workflow');

    const toState = await this.states.findOne({ where: { id: input.toStateId, workflowId } });
    if (!toState) throw new NotFoundException('Target state (toStateId) not found in this workflow');

    const key = input.key.trim().toLowerCase();
    const existing = await this.transitions.findOne({ where: { workflowId, fromStateId: input.fromStateId, toStateId: input.toStateId } });
    if (existing) throw new ConflictException('A transition already exists between these states');

    const transition = this.transitions.create({
      workflowId,
      key,
      name: input.name.trim(),
      fromStateId: input.fromStateId,
      toStateId: input.toStateId,
      requireComment: input.requireComment ?? false,
      sortOrder: input.sortOrder ?? 0,
    });

    return this.transitions.save(transition);
  }

  async updateTransition(orgId: string, workflowId: string, transitionId: string, input: UpdateTransitionDto) {
    const workflow = await this.workflows.findOne({ where: { id: workflowId, orgId } });
    if (!workflow) throw new NotFoundException('Workflow not found');

    const transition = await this.transitions.findOne({ where: { id: transitionId, workflowId } });
    if (!transition) throw new NotFoundException('Workflow transition not found');

    if (input.key !== undefined) transition.key = input.key.trim().toLowerCase();
    if (input.name !== undefined) transition.name = input.name.trim();
    if (input.requireComment !== undefined) transition.requireComment = input.requireComment;
    if (input.sortOrder !== undefined) transition.sortOrder = input.sortOrder;

    return this.transitions.save(transition);
  }

  async deleteTransition(orgId: string, workflowId: string, transitionId: string) {
    const workflow = await this.workflows.findOne({ where: { id: workflowId, orgId } });
    if (!workflow) throw new NotFoundException('Workflow not found');

    const transition = await this.transitions.findOne({ where: { id: transitionId, workflowId } });
    if (!transition) throw new NotFoundException('Workflow transition not found');

    await this.guards.delete({ transitionId });
    await this.transitions.delete(transitionId);
    return { success: true };
  }
}

