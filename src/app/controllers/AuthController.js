import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import authConfig from '../../config/authConfig';

class AuthController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    if (user.auth_level !== 0 && user.auth_level !== 1) {
      return res.status(403).json({ error: 'Não é funcionário' });
    }

    if (!(await user.checkPassword(password)))
      return res.status(401).json({ error: 'Senha inválida' });

    const { id, name, auth_level } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        auth_level,
      },
      token: jwt.sign({ auth_level }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new AuthController();
