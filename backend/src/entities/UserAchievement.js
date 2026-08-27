import { EntitySchema } from 'typeorm';

export const UserAchievementEntity = new EntitySchema({
  name: 'UserAchievement',
  tableName: 'user_achievements',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    userId: { type: 'uuid' },
    achievementId: { type: 'uuid' },
    earnedAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'CASCADE',
    },
    achievement: {
      type: 'many-to-one',
      target: 'Achievement',
      joinColumn: { name: 'achievementId' },
      onDelete: 'CASCADE',
    },
  },
  uniques: [{ name: 'uq_user_achievement', columns: ['userId', 'achievementId'] }],
});
