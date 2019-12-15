import * as Yup from 'yup';
import { Op } from 'sequelize';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    // Verifica se email já está cadastrado
    const emailExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (emailExists)
      return res.status(400).json({ error: 'Email já cadastrado' });

    // Cadastra estudante
    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      q: Yup.string(),
    });

    if (!(await schema.isValid(req.query)))
      return res.status(400).json({ error: 'Erro de validação' });

    const { p = 1, q = null } = req.query;

    const user = await Student.findAll({
      where: {
        name: { [Op.iLike]: `%${q || ''}%` },
        deleted_at: null,
      },
      order: ['name'],
      limit: 20,
      offset: (p - 1) * 20,
    });

    return res.json(user);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });
    const { id } = req.body;

    const student = await Student.findByPk(id);

    if (!student)
      return res.status(401).json({ error: 'Usuário não encontrado' });

    return res.json({ student });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    const student = await Student.findByPk(req.params.studentId);

    if (!student)
      return res.status(401).json({ error: 'Estudante não encontrado' });

    // Se email estiver sendo alterado
    if (req.body.email !== student.email) {
      // Verifica se o novo email já está cadastrado
      const emailExists = await Student.findOne({
        where: { email: req.body.email },
      });

      if (emailExists)
        return res.status(401).json({ error: 'Email já cadastrado' });
    }

    const response = await student.update(req.body);

    return res.json(response);
  }

  async delete(req, res) {
    const student = await Student.findByPk(req.params.studentId);

    if (!student)
      return res.status(401).json({ error: 'Aluno não encontrado' });

    if (student.deleted_at)
      return res.status(400).json({ error: 'Este aluno já foi excluído' });

    await student.update({
      deleted_at: new Date(),
      email: null,
    });

    return res.json({ message: 'Aluno excluído com sucesso' });
  }
}

export default new StudentController();
