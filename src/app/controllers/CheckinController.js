import { subDays, endOfDay, startOfDay } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Checkin from '../schemas/Checkin';

// CHECKINS ARMAZENADOS NO MONGO

class CheckinController {
  async store(req, res) {
    const schema = Yup.object().shape({
      studentId: Yup.number(),
    });

    if (!(await schema.isValid(req.params)))
      return res.status(400).json({ error: 'Erro de validação' });

    const student_id = req.params.studentId;

    const isStudent = await Student.findByPk(student_id);

    if (!isStudent)
      return res.status(401).json({ error: 'Aluno não encontrado' });

    const isEnrolled = await Enrollment.findOne({
      where: {
        student_id,
        canceled_at: null,
        start_date: {
          [Op.lte]: startOfDay(new Date()),
        },
        end_date: {
          [Op.gte]: endOfDay(new Date()),
        },
      },
    });

    if (!isEnrolled)
      return res.status(401).json({ error: 'Aluno não matriculado' });

    const daysCheckin = 7; // Numero de dias anteriores a contar os checkin
    const checkinLimit = 5; // Limite de checkins

    const lastCheckins = await Checkin.countDocuments({
      student_id,
      createdAt: { $gt: endOfDay(subDays(new Date(), daysCheckin)) },
    });

    if (lastCheckins >= checkinLimit)
      return res.status(401).json({ error: 'Limite de checkins atingido' });

    const { createdAt } = await Checkin.create({ student_id });

    const studentName = isStudent.name;
    const studentEmail = isStudent.email;

    return res.json({
      student_id,
      studentName,
      studentEmail,
      createdAt,
    });
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      studentId: Yup.number(),
    });

    if (!(await schema.isValid(req.params)))
      return res.status(400).json({ error: 'Erro de validação' });

    const daysCheckin = 7; // Numero de dias anteriores a contar os checkin
    const student_id = req.params.studentId;

    const checkins = await Checkin.find({
      student_id,
      createdAt: { $gt: endOfDay(subDays(new Date(), daysCheckin)) },
    }).sort({ createdAt: 'asc' });

    return res.json(checkins);
  }
}

export default new CheckinController();
