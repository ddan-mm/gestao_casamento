import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateGuest1754427332898 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'guests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'int4',
          },
          {
            name: 'names',
            type: 'varchar',
            isArray: true,
          },
          {
            name: 'quantity',
            type: 'int4',
            default: 1,
          },
          {
            name: 'family',
            type: 'boolean',
            default: false,
          },
          {
            name: 'confirmed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('guests');
  }
}
