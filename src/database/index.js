import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import dbConfig from '../config/dbConfig';
import User from '../app/models/User';
import Student from '../app/models/Student';
import Plan from '../app/models/Plan';
import Enrollment from '../app/models/Enrollment';
import HelpOrder from '../app/models/Helporder';

const models = [User, Student, Plan, Enrollment, HelpOrder];

class Database {
  constructor() {
    this.init();
    this.mongo();
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

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    });
  }
}

export default new Database();
