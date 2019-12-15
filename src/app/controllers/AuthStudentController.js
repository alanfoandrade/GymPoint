import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import Student from '../models/Student';
import authConfig from '../../config/authConfig';

class AuthStudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });
    const { id } = req.body;

    const student = await Student.findByPk(id);

    if (!student)
      return res.status(401).json({ error: 'Usuário não encontrado' });

    return res.json({
      student,
      token: jwt.sign({ id: student.id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new AuthStudentController();
