import * as Yup from 'yup';

import Helporder from '../models/Helporder';
import Student from '../models/Student';
import AnswerHelpMail from '../jobs/AnswerHelpMail';
import QueueLib from '../../lib/QueueLib';

class ProviderHelpController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const helporders = await Helporder.findAll({
      where: { answer_at: null },
      attributes: ['id', 'question'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name'],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });

    if (helporders.length === 0) return res.status(204);

    return res.json(helporders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    const helporder = await Helporder.findByPk(req.params.orderId, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!helporder)
      return res.status(401).json({ error: 'Pedido de ajuda não encontrado' });

    if (helporder.answer_at)
      return res
        .status(401)
        .json({ error: 'Pedido de ajuda já foi respondido' });

    await helporder.update({ answer: req.body.answer, answer_at: new Date() });

    await QueueLib.add(AnswerHelpMail.key, {
      studentName: helporder.student.name,
      studentEmail: helporder.student.email,
      question: helporder.question,
      answer: helporder.answer,
    });

    return res.json(helporder);
  }
}

export default new ProviderHelpController();
