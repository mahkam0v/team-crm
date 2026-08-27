import { EntitySchema } from 'typeorm';

export const FileEntity = new EntitySchema({
  name: 'File',
  tableName: 'files',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    ownerId: { type: 'uuid' },
    entityType: { type: 'varchar' }, // 'PROJECT' | 'TASK' | 'NOTE'
    entityId: { type: 'uuid' },
    path: { type: 'varchar' },
    originalName: { type: 'varchar' },
    mimeType: { type: 'varchar' },
    createdAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    owner: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'ownerId' },
      onDelete: 'CASCADE',
    },
  },
});
