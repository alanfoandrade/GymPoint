import { startOfDay, parseISO, isBefore, addMonths } from 'date-fns';
import { Op } from 'sequelize';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

class EnrollmentController {
  async store(req, res) {
    const { student_id, plan_id, start_date } = req.body;

    const hasStudent = await Student.findByPk(student_id);

    if (!hasStudent)
      return res.status(401).json({ message: 'Aluno não encontrado' });

    const hasPlan = await Plan.findByPk(plan_id);

    if (!hasPlan)
      return res.status(401).json({ message: 'Plano não encontrado' });

    const startDate = startOfDay(parseISO(start_date));
    const end_date = addMonths(startDate, hasPlan.duration);
    const price = hasPlan.price * hasPlan.duration;

    if (isBefore(startDate, new Date()))
      return res.status(400).json({ error: 'Data já passou' });

    const hasEnrollment = await Enrollment.findOne({
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

    if (hasEnrollment)
      return res.status(401).json({ message: 'Aluno já está matriculado' });

    const { created_at, updated_at } = await Enrollment.create({
      ...req.body,
      start_date,
      end_date,
      price
    });

    return res.json({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
      created_at,
      updated_at
    });
  }

  async index(req, res) {
    const enrollments = await Enrollment.findAll();

    if (enrollments.length === 0)
      return res.status(400).json({ error: 'Matrícula não encontrada' });

    return res.json(enrollments);
  }

  async update(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.enrollId);

    if (!enrollment)
      return res.status(401).json({ error: 'Matrícula não encontrada' });

    await enrollment.update(req.body);

    return res.json(enrollment);
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.enrollId);

    if (!enrollment)
      return res.status(401).json({ error: 'Matrícula não encontrada' });

    await enrollment.destroy();

    return res.json({ message: 'Matrícula excluída' });
  }
}

export default new EnrollmentController();
