import { AppDataSource } from '../config/data-source.js';

export const getUserRepo = () => AppDataSource.getRepository('User');
export const getProjectRepo = () => AppDataSource.getRepository('Project');
export const getProjectMemberRepo = () => AppDataSource.getRepository('ProjectMember');
export const getTaskRepo = () => AppDataSource.getRepository('Task');
export const getTransactionRepo = () => AppDataSource.getRepository('Transaction');
export const getNotificationRepo = () => AppDataSource.getRepository('Notification');
export const getActivityLogRepo = () => AppDataSource.getRepository('ActivityLog');
export const getAchievementRepo = () => AppDataSource.getRepository('Achievement');
export const getUserAchievementRepo = () => AppDataSource.getRepository('UserAchievement');
export const getFileRepo = () => AppDataSource.getRepository('File');
export const getProjectChatMessageRepo = () => AppDataSource.getRepository('ProjectChatMessage');
export const getTaskCommentRepo = () => AppDataSource.getRepository('TaskComment');
export const getTagRepo = () => AppDataSource.getRepository('Tag');
export const getUserSettingsRepo = () => AppDataSource.getRepository('UserSettings');
export const getNoteRepo = () => AppDataSource.getRepository('Note');
export const getRefreshTokenRepo = () => AppDataSource.getRepository('RefreshToken');
