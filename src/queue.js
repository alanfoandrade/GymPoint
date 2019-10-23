import 'dotenv/config';
import QueueLib from './lib/QueueLib';

// Executa a fila de forma independente da thread da aplicação
QueueLib.processQueue();
