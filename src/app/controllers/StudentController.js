import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    // Verifica se email já está cadastrado
    const emailExists = await Student.findOne({
      where: { email: req.body.email }
    });

    if (emailExists)
      return res.status(400).json({ error: 'Email já cadastrado' });

    // Cadastra estudante
    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }

  async update(req, res) {
    const student = await Student.findByPk(req.params.studentId);

    if (!student)
      return res.status(400).json({ error: 'Estudante não encontrado' });

    // Se email estiver sendo alterado
    if (req.body.email !== student.email) {
      // Verifica se o novo email já está cadastrado
      const emailExists = await Student.findOne({
        where: { email: req.body.email }
      });

      if (emailExists)
        return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const { id, name, email, age, weight, height } = await student.update(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }
}

export default new StudentController();
