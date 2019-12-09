import * as Yup from 'yup';
import { Op } from 'sequelize';
import Plan from '../models/Plan';

class PlanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      length: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    // Verifica se já existe o mesmo tipo de plano
    const PlanExists = await Plan.findOne({
      where: {
        title: req.body.title,
        canceled_at: null,
      },
    });

    if (PlanExists)
      return res
        .status(400)
        .json({ error: 'Existe outro plano com esse nome cadastrado' });

    // Cadastra plano
    const {
      id,
      title,
      length,
      price,
      created_at,
      updated_at,
    } = await Plan.create(req.body);

    return res.json({ id, title, length, price, created_at, updated_at });
  }

  async index(req, res) {
    const { p = 1, q = null } = req.query;
    const plans = await Plan.findAll({
      where: {
        title: { [Op.iLike]: `%${q || ''}%` },
        canceled_at: null,
      },
      order: ['length'],
      attributes: ['id', 'title', 'length', 'price'],
      limit: 20,
      offset: (p - 1) * 20,
    });

    return res.json(plans);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      length: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) return res.status(401).json({ error: 'Plano não encontrado' });

    if (req.body.title !== plan.title) {
      // Verifica se já existe o mesmo tipo de plano
      const PlanExists = await Plan.findOne({
        where: {
          title: req.body.title,
          canceled_at: null,
        },
      });

      if (PlanExists)
        return res
          .status(400)
          .json({ error: 'Existe outro plano com esse nome cadastrado' });
    }

    const { title, length, price } = await plan.update(req.body);

    return res.json({ title, length, price });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) return res.status(401).json({ error: 'Plano não encontrado' });

    if (plan.canceled_at)
      return res.status(400).json({ error: 'Este plano já foi cancelado' });

    await plan.update({
      canceled_at: new Date(),
    });
    // await plan.destroy();

    return res.json({ message: 'Plano cancelado com sucesso' });
  }
}

export default new PlanController();
