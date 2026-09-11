import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from '../../database/entities/workflow/workflow.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { WorkflowTransition } from '../../database/entities/workflow/workflow-transition.entity';
import { WorkflowTransitionGuard } from '../../database/entities/workflow/workflow-transition-guard.entity';
import { CreateGuardDto, CreateWorkflowDto } from './dto/workflow.dto';

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
}
