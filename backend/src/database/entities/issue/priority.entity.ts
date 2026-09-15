import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('priorities')
@Unique(['orgId', 'key'])
export class Priority {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ length: 64 }) key!: string;
  @Column({ length: 120 }) name!: string;
  @Column({ length: 32, default: '#6366f1' }) color!: string;
  @Column({ name: 'order_num', type: 'int', default: 0 }) orderNum!: number;
  @Column({ name: 'is_default', default: false }) isDefault!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
