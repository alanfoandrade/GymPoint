import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/authConfig';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: 'Token não informado' });

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.auth_level = decoded.auth_level;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Falha de autenticação' });
  }
};
