import { Router } from 'express';
import StudentController from './app/controllers/StudentController';
import AuthController from './app/controllers/AuthController';
import authMiddleware from './app/middlewares/authMiddleware';

const roleAdmin = require('./app/middlewares/roleMiddleware')(
  'admin@gympoint.com'
);

const routes = new Router();

routes.post('/auth', AuthController.store);

// Apenas usuários logados tem acesso as proximas rotas
routes.use(authMiddleware);

// Apenas Admin tem acesso as proximas rotas
routes.use(roleAdmin.authorization);

routes.post('/students', StudentController.store);
routes.put('/students/:studentId', StudentController.update);

export default routes;
