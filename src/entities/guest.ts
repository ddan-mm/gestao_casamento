import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GuestType {
  INDIVIDUAL = 1,
  FAMILY = 2,
}

export enum GuestStatus {
  PENDING = 1,
  CONFIRMED = 2,
  DECLINED = 3,
  PRESENT_AT_EVENT = 4,
}

@Entity('guests')
export class GuestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: GuestType;

  @Column('text', { array: true })
  names: string[];

  @Column()
  quantity: number;

  @Column({ default: GuestStatus.PENDING })
  status: GuestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
