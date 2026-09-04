import { EntitySchema } from 'typeorm';

export const RefreshTokenEntity = new EntitySchema({
  name: 'RefreshToken',
  tableName: 'refresh_tokens',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    userId: { type: 'uuid' },
    // sha256 hash of the raw JWT — the raw token is never stored
    tokenHash: { type: 'varchar', unique: true },
    expiresAt: { type: 'timestamp' },
    revokedAt: { type: 'timestamp', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
  },
  indices: [{ name: 'idx_refresh_token_user', columns: ['userId'] }],
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'CASCADE',
    },
  },
});
