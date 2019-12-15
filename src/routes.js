import { Router } from 'express';

import authMiddleware from './app/middlewares/authMiddleware';
import roleMiddleware from './app/middlewares/roleMiddleware';
import AuthController from './app/controllers/AuthController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import ProviderHelpController from './app/controllers/ProviderHelpController';
import StudentHelpController from './app/controllers/StudentHelpController';

/**
 * Seta o auth_level requerido(role), que comparado com o auth_level do usuario logado
 * ao utilizar as rotas abaixo do use(roleAdmin.authorization....)
 */
const roleAdmin = roleMiddleware(0); // 0=admin 1=atendente 2=instrutor 3=aluno
/*
const roleProvider = roleMiddleware(1);
const roleInstructor = roleMiddleware(2);
const roleStudent = roleMiddleware(3);
 */
const routes = new Router();

routes.post('/auth/student', StudentController.show);
routes.post('/auth', AuthController.store);

// CheckinController
routes.post('/students/:studentId/checkins', CheckinController.store);
routes.get('/students/:studentId/checkins', CheckinController.index);

// StudentHelpController
routes.post('/students/:studentId/help-orders', StudentHelpController.store);
routes.get('/students/:studentId/help-orders', StudentHelpController.index);

// Apenas usuários logados tem acesso as proximas rotas
routes.use(authMiddleware);

// Apenas Admin tem acesso as proximas rotas
routes.use(roleAdmin.authorization);

// StudentController
routes.post('/students', StudentController.store);
routes.get('/students', StudentController.index);
routes.put('/students/:studentId', StudentController.update);
routes.delete('/students/:studentId', StudentController.delete);

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

// ProviderHelpController
routes.get('/help-orders/unanswered', ProviderHelpController.index);
routes.post('/help-orders/:orderId/answer', ProviderHelpController.store);

export default routes;
