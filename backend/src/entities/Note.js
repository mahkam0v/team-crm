import { EntitySchema } from 'typeorm';

export const NoteEntity = new EntitySchema({
  name: 'Note',
  tableName: 'notes',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    content: { type: 'text' },
    authorId: { type: 'uuid' },
    projectId: { type: 'uuid', nullable: true },
    taskId: { type: 'uuid', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    author: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'authorId' },
      onDelete: 'CASCADE',
    },
  },
});
