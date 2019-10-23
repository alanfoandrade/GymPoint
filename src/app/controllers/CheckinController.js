import { subDays, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Checkin from '../models/Checkin';

class CheckinController {
  async store(req, res) {
    const schema = Yup.object().shape({
      studentId: Yup.number()
    });

    if (!(await schema.isValid(req.params)))
      return res.status(400).json({ error: 'Erro de validação' });

    const daysCheckin = 7; // Numero de dias anteriores a contar os checkin
    const checkinLimit = 5; // Limite de checkins
    const { studentId } = req.params;

    const isStudent = await Student.findByPk(studentId);

    if (!isStudent)
      return res.status(401).json({ message: 'Aluno não encontrado' });

    const DaysAgo = subDays(new Date(), daysCheckin);

    const lastCheckins = await Checkin.findAll({
      where: {
        student_id: studentId,
        created_at: {
          [Op.between]: [DaysAgo, new Date()]
        }
      }
    });

    const checkinCount = lastCheckins.length;

    if (checkinCount >= checkinLimit)
      return res.status(401).json({ message: 'Limite de checkins atingido' });

    const isEnrolled = await Enrollment.findOne({
      where: {
        student_id: studentId,
        canceled_at: null,
        end_date: {
          [Op.gte]: endOfDay(new Date())
        }
      }
    });

    if (!isEnrolled)
      return res.status(401).json({ message: 'Aluno não matriculado' });

    const { created_at, updated_at } = await Checkin.create({
      student_id: studentId
    });

    const studentName = isStudent.name;
    const studentEmail = isStudent.email;

    return res.json({
      studentName,
      studentEmail,
      created_at,
      updated_at
    });
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      studentId: Yup.number()
    });

    if (!(await schema.isValid(req.params)))
      return res.status(400).json({ error: 'Erro de validação' });

    const { studentId } = req.params;

    const checkins = await Checkin.findAll({
      where: { student_id: studentId }
    });

    if (checkins.length === 0)
      return res.status(400).json({ error: 'Nenhum checkin encontrado' });

    return res.json(checkins);
  }
}

export default new CheckinController();
