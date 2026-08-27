import { EntitySchema } from 'typeorm';

export const AchievementEntity = new EntitySchema({
  name: 'Achievement',
  tableName: 'achievements',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    key: { type: 'varchar', unique: true },
    title: { type: 'varchar' },
    description: { type: 'varchar' },
    category: { type: 'varchar' },
  },
});
