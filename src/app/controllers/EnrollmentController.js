import { startOfDay, parseISO, isBefore, addMonths, format } from 'date-fns';
import { Op } from 'sequelize';
import pt from 'date-fns/locale/pt';
import * as Yup from 'yup';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';
import QueueLib from '../../lib/QueueLib';
import EnrollMail from '../jobs/EnrollMail';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.integer(),
      plan_id: Yup.integer(),
      start_date: Yup.date()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    const { student_id, plan_id, start_date } = req.body;

    const isStudent = await Student.findByPk(student_id);

    if (!isStudent)
      return res.status(401).json({ message: 'Aluno não encontrado' });

    const isPlan = await Plan.findByPk(plan_id);

    if (!isPlan)
      return res.status(401).json({ message: 'Plano não encontrado' });

    const startDate = startOfDay(parseISO(start_date));
    const end_date = addMonths(startDate, isPlan.length);
    const enrollPrice = isPlan.price * isPlan.length;

    if (isBefore(startDate, new Date()))
      return res.status(400).json({ error: 'Data já passou' });

    const isEnrolled = await Enrollment.findOne({
      where: {
        student_id,
        canceled_at: null,
        start_date: {
          [Op.lte]: end_date
        },
        end_date: {
          [Op.gt]: startDate
        }
      }
    });

    if (isEnrolled)
      return res
        .status(401)
        .json({ message: 'Aluno já tem matrícula ativa para essa data' });

    const { created_at, updated_at } = await Enrollment.create({
      ...req.body,
      start_date,
      end_date,
      enrollPrice
    });

    const enrollStartDate = format(startDate, "dd 'de' MMMM 'de' yyyy", {
      locale: pt
    });

    const enrollEndDate = format(end_date, "dd 'de' MMMM 'de' yyyy", {
      locale: pt
    });

    const studentName = isStudent.name;
    const studentEmail = isStudent.email;
    const planTitle = isPlan.title;
    const planLength = isPlan.length;
    const planPrice = isPlan.price;

    await QueueLib.add(EnrollMail.key, {
      studentName,
      studentEmail,
      planTitle,
      planLength,
      planPrice,
      enrollStartDate,
      enrollEndDate,
      enrollPrice
    });

    return res.json({
      studentName,
      studentEmail,
      planTitle,
      planLength,
      planPrice,
      enrollStartDate,
      enrollEndDate,
      enrollPrice,
      created_at,
      updated_at
    });
  }

  async index(req, res) {
    const enrollments = await Enrollment.findAll();

    if (enrollments.length === 0)
      return res.status(400).json({ error: 'Nenhuma matrícula encontrada' });

    return res.json(enrollments);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.integer().required(),
      plan_id: Yup.integer().required(),
      start_date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    const enrollment = await Enrollment.findByPk(req.params.enrollId);

    if (!enrollment)
      return res.status(401).json({ error: 'Matrícula não encontrada' });

    const { student_id, plan_id, start_date } = req.body;

    const isStudent = await Student.findByPk(student_id);

    if (!isStudent)
      return res.status(401).json({ message: 'Aluno não encontrado' });

    const isPlan = await Plan.findByPk(plan_id);

    if (!isPlan)
      return res.status(401).json({ message: 'Plano não encontrado' });

    const startDate = startOfDay(parseISO(start_date));
    const end_date = addMonths(startDate, isPlan.length);
    const enrollPrice = isPlan.price * isPlan.length;

    if (isBefore(startDate, new Date()))
      return res.status(400).json({ error: 'Data já passou' });

    const isEnrolled = await Enrollment.findOne({
      where: {
        id: {
          [Op.ne]: req.params.enrollId
        },
        student_id,
        canceled_at: null,
        start_date: {
          [Op.lte]: end_date
        },
        end_date: {
          [Op.gt]: startDate
        }
      }
    });

    if (isEnrolled)
      return res
        .status(401)
        .json({ message: 'Aluno já tem matrícula ativa para essa data' });

    const { created_at, updated_at } = await Enrollment.create({
      ...req.body,
      start_date,
      end_date,
      enrollPrice
    });

    const enrollStartDate = format(startDate, "dd 'de' MMMM 'de' yyyy", {
      locale: pt
    });

    const enrollEndDate = format(end_date, "dd 'de' MMMM 'de' yyyy", {
      locale: pt
    });

    const studentName = isStudent.name;
    const studentEmail = isStudent.email;
    const planTitle = isPlan.title;
    const planLength = isPlan.length;
    const planPrice = isPlan.price;

    await enrollment.update(req.body);

    return res.json({
      studentName,
      studentEmail,
      planTitle,
      planLength,
      planPrice,
      enrollStartDate,
      enrollEndDate,
      enrollPrice,
      created_at,
      updated_at
    });
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.enrollId);

    if (!enrollment)
      return res.status(401).json({ error: 'Matrícula não encontrada' });

    if (enrollment.canceled_at)
      return res.status(400).json({ error: 'Esta matrícula já foi cancelada' });

    await enrollment.update({
      canceled_at: new Date()
    });

    // await enrollment.destroy();

    return res.json({ message: 'Matrícula cancelada' });
  }
}

export default new EnrollmentController();
