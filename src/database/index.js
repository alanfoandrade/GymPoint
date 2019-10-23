import Sequelize from 'sequelize';
import dbConfig from '../config/dbConfig';
import User from '../app/models/User';
import Student from '../app/models/Student';
import Plan from '../app/models/Plan';
import Enrollment from '../app/models/Enrollment';

const models = [User, Student, Plan, Enrollment];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(dbConfig);

    /*
    Inicia cada model da pasta models através do método 'init()',
    passando a 'this.connection' criada acima,
    pelo parâmetro 'sequelize' recebido na model.
    */
    models
      .map(model => model.init(this.connection))
      // cria os relacionamentos de cada model
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
