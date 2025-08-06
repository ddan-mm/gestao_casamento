import 'dotenv/config';
import 'reflect-metadata';
import path from 'path';
import { DataSource } from 'typeorm';
import { GuestEntity } from '../entities/guest';

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: isProd
    ? [path.join(__dirname, '../entities/*.js')] // aponta para JS compilado
    : [GuestEntity], // no dev importa direto a classe
  migrations: isProd
    ? [path.join(__dirname, '../migrations/*.js')]
    : ['src/migrations/**/*.ts'],
  ssl: isProd ? { rejectUnauthorized: false } : false, // caso precise SSL
});
