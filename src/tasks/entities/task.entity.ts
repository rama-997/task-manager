import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { TaskStatus } from '@src/tasks/types'

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    readonly id?: string

    @Column()
    title: string

    @Column()
    description: string

    @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
    status: TaskStatus

    @CreateDateColumn({ name: 'created_at' })
    readonly createdAt?: Date

    @UpdateDateColumn({ name: 'updated_at' })
    readonly updatedAt?: Date
}