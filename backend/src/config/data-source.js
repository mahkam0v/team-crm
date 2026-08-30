import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

import { UserEntity } from '../entities/User.js';
import { ProjectEntity } from '../entities/Project.js';
import { ProjectMemberEntity } from '../entities/ProjectMember.js';
import { TaskEntity } from '../entities/Task.js';
import { TransactionEntity } from '../entities/Transaction.js';
import { NotificationEntity } from '../entities/Notification.js';
import { ActivityLogEntity } from '../entities/ActivityLog.js';
import { AchievementEntity } from '../entities/Achievement.js';
import { UserAchievementEntity } from '../entities/UserAchievement.js';
import { FileEntity } from '../entities/File.js';
import { ProjectChatMessageEntity } from '../entities/ProjectChatMessage.js';
import { TaskCommentEntity } from '../entities/TaskComment.js';
import { TagEntity } from '../entities/Tag.js';
import { UserSettingsEntity } from '../entities/UserSettings.js';
import { NoteEntity } from '../entities/Note.js';

dotenv.config();

export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: false,
        ssl: {
          rejectUnauthorized: false,
        },
        entities: [
          UserEntity,
          ProjectEntity,
          ProjectMemberEntity,
          TaskEntity,
          TransactionEntity,
          NotificationEntity,
          ActivityLogEntity,
          AchievementEntity,
          UserAchievementEntity,
          FileEntity,
          ProjectChatMessageEntity,
          TaskCommentEntity,
          TagEntity,
          UserSettingsEntity,
          NoteEntity,
        ],
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: false,
        entities: [
          UserEntity,
          ProjectEntity,
          ProjectMemberEntity,
          TaskEntity,
          TransactionEntity,
          NotificationEntity,
          ActivityLogEntity,
          AchievementEntity,
          UserAchievementEntity,
          FileEntity,
          ProjectChatMessageEntity,
          TaskCommentEntity,
          TagEntity,
          UserSettingsEntity,
          NoteEntity,
        ],
      }
);