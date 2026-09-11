import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('custom_field_options')
export class CustomFieldOption {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'custom_field_id', type: 'uuid' }) customFieldId!: string;
  @Column({ length: 120 }) value!: string;
  @Column({ length: 160 }) label!: string;
  @Column({ type: 'int', default: 0 }) position!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
