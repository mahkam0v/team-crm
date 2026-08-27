import { EntitySchema } from 'typeorm';

export const TaskEntity = new EntitySchema({
  name: 'Task',
  tableName: 'tasks',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    title: { type: 'varchar' },
    description: { type: 'text', nullable: true },
    status: {
      type: 'enum',
      enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'TODO',
    },
    priority: {
      type: 'enum',
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    dueDate: { type: 'timestamp', nullable: true },
    projectId: { type: 'uuid', nullable: true },
    assignedUserId: { type: 'uuid', nullable: true },
    creatorId: { type: 'uuid' },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    project: {
      type: 'many-to-one',
      target: 'Project',
      joinColumn: { name: 'projectId' },
      inverseSide: 'tasks',
      onDelete: 'CASCADE',
      nullable: true,
    },
    assignee: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'assignedUserId' },
      nullable: true,
    },
    creator: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'creatorId' },
    },
    comments: {
      type: 'one-to-many',
      target: 'TaskComment',
      inverseSide: 'task',
    },
  },
});
