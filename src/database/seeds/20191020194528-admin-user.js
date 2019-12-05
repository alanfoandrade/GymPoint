// CommonJS File

const bcrypt = require('bcryptjs');

module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'users',
      [
        {
          name: 'Administrador',
          email: 'admin@gympoint.com',
          password_hash: bcrypt.hashSync('123456', 8),
          auth_level: 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Atendente',
          email: 'atendente@gympoint.com',
          password_hash: bcrypt.hashSync('123456', 8),
          auth_level: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Teste',
          email: 'teste@gympoint.com',
          password_hash: bcrypt.hashSync('123456', 8),
          auth_level: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
