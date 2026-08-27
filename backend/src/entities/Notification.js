import { EntitySchema } from 'typeorm';

export const NotificationEntity = new EntitySchema({
  name: 'Notification',
  tableName: 'notifications',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    userId: { type: 'uuid' },
    type: { type: 'varchar' },
    message: { type: 'text' },
    entityType: { type: 'varchar', nullable: true },
    entityId: { type: 'uuid', nullable: true },
    isRead: { type: 'boolean', default: false },
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
