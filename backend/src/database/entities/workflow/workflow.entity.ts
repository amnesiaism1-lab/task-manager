import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('workflows')
@Index(['orgId', 'key', 'version'], { unique: true })
export class Workflow {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ length: 64 }) key!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ type: 'int', default: 1 }) version!: number;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
