import { EntitySchema } from 'typeorm';

export const ProjectChatMessageEntity = new EntitySchema({
  name: 'ProjectChatMessage',
  tableName: 'project_chat_messages',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: 'uuid' },
    authorId: { type: 'uuid' },
    message: { type: 'text' },
    createdAt: { type: 'timestamp', createDate: true },
    editedAt: { type: 'timestamp', nullable: true },
  },
  relations: {
    project: {
      type: 'many-to-one',
      target: 'Project',
      joinColumn: { name: 'projectId' },
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
