// Common JS File
module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'gympointdb',
  define: {
    timestamps: true,
    underscored: true,
    unterscoredAll: true
  }
};
