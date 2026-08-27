import { EntitySchema } from 'typeorm';

export const UserSettingsEntity = new EntitySchema({
  name: 'UserSettings',
  tableName: 'user_settings',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    userId: { type: 'uuid', unique: true },
    dashboardWidgets: { type: 'jsonb', nullable: true },
    notificationPrefs: { type: 'jsonb', nullable: true },
  },
  relations: {
    user: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'CASCADE',
    },
  },
});
