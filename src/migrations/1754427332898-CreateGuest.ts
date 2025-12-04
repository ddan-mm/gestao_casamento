import { QueryRunner, Table } from 'typeorm';

export class CreateGuest1754427332898 {
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
            name: 'status',
            type: 'int4',
            default: 1,
          },
          {
            name: 'cellphone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
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
