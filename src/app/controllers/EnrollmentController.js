import {
  startOfDay,
  endOfDay,
  parseISO,
  isBefore,
  addMonths,
  format,
  getUnixTime,
} from 'date-fns';
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
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    const { student_id, plan_id, start_date } = req.body;

    const isStudent = await Student.findByPk(student_id);

    if (!isStudent)
      return res.status(401).json({ error: 'Aluno não encontrado' });

    const isPlan = await Plan.findOne({
      where: { id: plan_id, canceled_at: null },
    });

    if (!isPlan) return res.status(401).json({ error: 'Plano não encontrado' });

    const startDate = startOfDay(parseISO(start_date));
    const end_date = endOfDay(addMonths(startDate, isPlan.length));
    const enrollPrice = isPlan.price * isPlan.length;

    if (isBefore(startDate, startOfDay(new Date())))
      return res.status(400).json({ error: 'Data já passou' });

    const isEnrolled = await Enrollment.findOne({
      where: {
        student_id,
        canceled_at: null,
        start_date: {
          [Op.lte]: end_date,
        },
        end_date: {
          [Op.gt]: startDate,
        },
      },
    });

    if (isEnrolled)
      return res
        .status(401)
        .json({ error: 'Aluno já tem matrícula ativa nesse período' });

    const { id } = await Enrollment.create({
      ...req.body,
      start_date: startDate,
      end_date,
      price: enrollPrice,
    });

    const enrollStartDate = format(startDate, "dd 'de' MMMM 'de' yyyy", {
      locale: pt,
    });

    const enrollEndDate = format(end_date, "dd 'de' MMMM 'de' yyyy", {
      locale: pt,
    });

    // Envia email de confirmacao de matricula
    await QueueLib.add(EnrollMail.key, {
      studentName: isStudent.name,
      studentEmail: isStudent.email,
      planTitle: isPlan.title,
      planLength: isPlan.length,
      planPrice: isPlan.price,
      enrollStartDate,
      enrollEndDate,
      enrollPrice,
    });

    const enrollment = await Enrollment.findByPk(id, {
      attributes: ['id', 'active', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'length', 'price'],
        },
      ],
    });

    return res.json(enrollment);
  }

  async index(req, res) {
    const { p = 1 } = req.query;

    const enrollments = await Enrollment.findAll({
      where: {
        canceled_at: null,
      },
      attributes: ['id', 'active', 'start_date', 'end_date', 'price'],
      order: ['end_date'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'length', 'price'],
        },
      ],
      limit: 20,
      offset: (p - 1) * 20,
    });

    return res.json(enrollments);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    const enrollment = await Enrollment.findByPk(req.params.enrollId, {
      attributes: ['id', 'active', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'length', 'price'],
        },
      ],
    });

    if (!enrollment)
      return res.status(401).json({ error: 'Matrícula não encontrada' });

    const { student_id, plan_id, start_date } = req.body;

    const isStudent = await Student.findByPk(student_id);

    if (!isStudent)
      return res.status(401).json({ error: 'Aluno não encontrado' });

    const isPlan = await Plan.findByPk(plan_id);

    if (!isPlan) return res.status(401).json({ error: 'Plano não encontrado' });

    const startDate = startOfDay(parseISO(start_date));
    const end_date = endOfDay(addMonths(startDate, isPlan.length));
    const enrollPrice = isPlan.price * isPlan.length;

    if (
      getUnixTime(parseISO(start_date)) !== getUnixTime(enrollment.start_date)
    ) {
      if (isBefore(startDate, startOfDay(new Date())))
        return res.status(400).json({ error: 'Data já passou' });
    }

    const isEnrolled = await Enrollment.findOne({
      where: {
        id: {
          [Op.ne]: req.params.enrollId,
        },
        student_id,
        canceled_at: null,
        start_date: {
          [Op.lte]: end_date,
        },
        end_date: {
          [Op.gt]: startDate,
        },
      },
    });

    if (isEnrolled)
      return res
        .status(401)
        .json({ error: 'Aluno já tem matrícula ativa para essa data' });

    await enrollment.update({
      ...req.body,
      start_date: startDate,
      end_date,
      price: enrollPrice,
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.enrollId);

    if (!enrollment)
      return res.status(401).json({ error: 'Matrícula não encontrada' });

    if (enrollment.canceled_at)
      return res.status(400).json({ error: 'Esta matrícula já foi cancelada' });

    await enrollment.update({
      canceled_at: new Date(),
    });

    // await enrollment.destroy();

    return res.json({ message: 'Matrícula cancelada' });
  }
}

export default new EnrollmentController();
