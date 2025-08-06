import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './controllers';
import { AppDataSource } from './database/data-source';

AppDataSource.initialize()
  .then(() => {
    console.log('Banco Railway conectado com sucesso!');
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
    AppDataSource.runMigrations();
  })
  .catch((error) => {
    console.error('Erro ao conectar no banco:', error);
  });

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
