import Sequelize, { Model } from 'sequelize';

class Plan extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        length: Sequelize.INTEGER,
        price: Sequelize.FLOAT,
        canceled_at: Sequelize.DATE,
      },
      { sequelize }
    );

    return this;
  }
}

export default Plan;
