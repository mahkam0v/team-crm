import { EntitySchema } from 'typeorm';

export const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    username: { type: 'varchar', unique: true },
    email: { type: 'varchar', unique: true },
    passwordHash: { type: 'varchar' },
    role: { type: 'enum', enum: ['SUPER_ADMIN', 'ADMIN', 'USER'], default: 'USER' },
    avatar: { type: 'varchar', nullable: true },
    bio: { type: 'text', nullable: true },
    currentlyWorkingOn: { type: 'varchar', nullable: true },
    status: {
      type: 'enum',
      enum: ['AVAILABLE', 'BUSY', 'DO_NOT_DISTURB', 'OFFLINE'],
      default: 'OFFLINE',
    },
    isDisabled: { type: 'boolean', default: false },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    ownedProjects: {
      type: 'one-to-many',
      target: 'Project',
      inverseSide: 'owner',
    },
  },
});
