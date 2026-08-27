import { EntitySchema } from 'typeorm';

export const ActivityLogEntity = new EntitySchema({
  name: 'ActivityLog',
  tableName: 'activity_logs',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    userId: { type: 'uuid' },
    action: { type: 'varchar' },
    entityType: { type: 'varchar' },
    entityId: { type: 'uuid', nullable: true },
    metadata: { type: 'jsonb', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'CASCADE',
    },
  },
});
