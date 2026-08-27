import { EntitySchema } from 'typeorm';

export const TagEntity = new EntitySchema({
  name: 'Tag',
  tableName: 'tags',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    name: { type: 'varchar', unique: true },
  },
});
