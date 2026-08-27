import { EntitySchema } from 'typeorm';

export const TaskCommentEntity = new EntitySchema({
  name: 'TaskComment',
  tableName: 'task_comments',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    taskId: { type: 'uuid' },
    authorId: { type: 'uuid' },
    message: { type: 'text' },
    createdAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    task: {
      type: 'many-to-one',
      target: 'Task',
      joinColumn: { name: 'taskId' },
      inverseSide: 'comments',
      onDelete: 'CASCADE',
    },
    author: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'authorId' },
      onDelete: 'CASCADE',
    },
  },
});
