import * as Yup from 'yup';
import Helporder from '../models/Helporder';
import Student from '../models/Student';

class StudentHelpController {
  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    const isStudent = await Student.findByPk(req.params.studentId);

    if (!isStudent)
      return res.status(401).json({ error: 'Aluno não encontrado' });

    const helporder = await Helporder.create({
      ...req.body,
      student_id: req.params.studentId,
    });

    return res.json(helporder);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const helporders = await Helporder.findAll({
      where: { student_id: req.params.studentId },
      order: [['createdAt', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(helporders);
  }
}

export default new StudentHelpController();
