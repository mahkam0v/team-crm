import { EntitySchema } from 'typeorm';

export const TransactionEntity = new EntitySchema({
  name: 'Transaction',
  tableName: 'transactions',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    type: { type: 'enum', enum: ['INCOME', 'EXPENSE'] },
    amount: { type: 'bigint' }, // whole so'm, never float
    currency: { type: 'varchar', default: 'UZS' },
    category: { type: 'varchar', nullable: true },
    description: { type: 'text', nullable: true },
    date: { type: 'date' },
    status: {
      type: 'enum',
      enum: ['RECEIVED_PAID', 'PENDING', 'CANCELLED'],
      default: 'PENDING',
    },
    projectId: { type: 'uuid', nullable: true },
    userId: { type: 'uuid' },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    project: {
      type: 'many-to-one',
      target: 'Project',
      joinColumn: { name: 'projectId' },
      inverseSide: 'transactions',
      onDelete: 'CASCADE',
      nullable: true,
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'CASCADE',
    },
  },
});
