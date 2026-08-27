import { EntitySchema } from 'typeorm';

export const ProjectMemberEntity = new EntitySchema({
  name: 'ProjectMember',
  tableName: 'project_members',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: 'uuid' },
    userId: { type: 'uuid' },
    addedAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    project: {
      type: 'many-to-one',
      target: 'Project',
      joinColumn: { name: 'projectId' },
      inverseSide: 'members',
      onDelete: 'CASCADE',
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'CASCADE',
    },
  },
  uniques: [{ name: 'uq_project_user', columns: ['projectId', 'userId'] }],
});
