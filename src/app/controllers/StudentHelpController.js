import * as Yup from 'yup';
import Helporder from '../models/Helporder';
import Student from '../models/Student';

class StudentHelpController {
  async index(req, res) {
    const helporders = await Helporder.findAll({
      where: { student_id: req.params.studentId },
    });

    if (helporders.length === 0)
      return res
        .status(400)
        .json({ error: 'Nenhum pedido de ajuda cadastrado para esse aluno' });

    return res.json(helporders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    const isStudent = await Student.findByPk(req.params.studentId);

    if (!isStudent)
      return res.status(401).json({ message: 'Aluno não encontrado' });

    const helporder = await Helporder.create({
      ...req.body,
      student_id: req.params.studentId,
    });

    return res.json(helporder);
  }
}

export default new StudentHelpController();
