import { Router } from 'express';
import StudentController from './app/controllers/StudentController';
import AuthController from './app/controllers/AuthController';
import authMiddleware from './app/middlewares/authMiddleware';
import roleMiddleware from './app/middlewares/roleMiddleware';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';

/**
 * Seta o email que sera comparado com o email do usuario logado
 * ao utilizar as rotas abaixo do use(roleAdmin.authorization....)
 */
const roleAdmin = roleMiddleware('admin@gympoint.com');

const routes = new Router();

routes.post('/auth', AuthController.store);

// Apenas usuários logados tem acesso as proximas rotas
routes.use(authMiddleware);

// Apenas Admin tem acesso as proximas rotas
routes.use(roleAdmin.authorization);

// StudentController
routes.post('/students', StudentController.store);
routes.put('/students/:studentId', StudentController.update);

// PlanController
routes.post('/plans', PlanController.store);
routes.get('/plans', PlanController.index);
routes.put('/plans/:planId', PlanController.update);
routes.delete('/plans/:planId', PlanController.delete);

// EnrollmentController
routes.post('/enrollments', EnrollmentController.store);
routes.get('/enrollments', EnrollmentController.index);
routes.put('/enrollments/:enrollId', EnrollmentController.update);
routes.delete('/enrollments/:enrollId', EnrollmentController.delete);

export default routes;
