import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true, length: 32 }) key!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ length: 32, default: 'free' }) plan!: string;
  @Column({ length: 32, default: 'active' }) status!: 'active' | 'suspended';
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
