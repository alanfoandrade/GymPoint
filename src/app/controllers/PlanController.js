import Plan from '../models/Plan';

class PlanController {
  async store(req, res) {
    // Verifica se já existe o mesmo tipo de plano
    const PlanExists = await Plan.findOne({
      where: { title: req.body.title }
    });

    if (PlanExists)
      return res.status(401).json({ error: 'Plano já cadastrado' });

    // Cadastra plano
    const {
      id,
      title,
      duration,
      price,
      created_at,
      updated_at
    } = await Plan.create(req.body);

    return res.json({ id, title, duration, price, created_at, updated_at });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const plans = await Plan.findAll({
      where: {
        canceled_at: null
      },
      order: ['duration'],
      attributes: ['id', 'title', 'duration', 'price'],
      limit: 20,
      offset: (page - 1) * 20
    });

    if (plans.length === 0)
      return res.status(400).json({ error: 'Nenhum plano encontrado' });

    return res.json(plans);
  }

  async update(req, res) {
    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) return res.status(401).json({ error: 'Plano não encontrado' });

    const { title, duration, price } = await plan.update(req.body);

    return res.json({ title, duration, price });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) return res.status(401).json({ error: 'Plano não encontrado' });

    /* if (plan.canceled_at)
      return res.status(400).json({ error: 'Este plano não está disponível' }); */

    // plan.canceled_at = new Date();

    await plan.destroy();

    return res.json({ message: 'Plano excluído com sucesso' });
  }
}

export default new PlanController();
