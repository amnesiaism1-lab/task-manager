import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('resolutions')
@Unique(['orgId', 'key'])
export class Resolution {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ length: 64 }) key!: string;
  @Column({ length: 120 }) name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'order_num', type: 'int', default: 0 }) orderNum!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
