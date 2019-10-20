import Sequelize from 'sequelize';
import dbConfig from '../config/dbConfig';
import User from '../app/models/User';
import Student from '../app/models/Student';

const models = [User, Student];

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
    models.map(model => model.init(this.connection));
  }
}

export default new Database();
