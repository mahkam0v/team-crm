import { EntitySchema } from 'typeorm';

export const ProjectEntity = new EntitySchema({
  name: 'Project',
  tableName: 'projects',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    name: { type: 'varchar' },
    description: { type: 'text', nullable: true },
    status: {
      type: 'enum',
      enum: ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'],
      default: 'PLANNING',
    },
    priority: {
      type: 'enum',
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    client: { type: 'varchar', nullable: true },
    ownerId: { type: 'uuid' },
    startDate: { type: 'date', nullable: true },
    deadline: { type: 'date', nullable: true },
    expectedIncome: { type: 'bigint', default: 0 },
    expectedExpense: { type: 'bigint', default: 0 },
    budget: { type: 'bigint', default: 0 },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    owner: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'ownerId' },
      onDelete: 'CASCADE',
    },
    members: {
      type: 'one-to-many',
      target: 'ProjectMember',
      inverseSide: 'project',
    },
    tasks: {
      type: 'one-to-many',
      target: 'Task',
      inverseSide: 'project',
    },
    transactions: {
      type: 'one-to-many',
      target: 'Transaction',
      inverseSide: 'project',
    },
  },
});
