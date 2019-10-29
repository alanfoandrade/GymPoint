// Common JS File

module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'plans',
      [
        {
          title: 'Start',
          length: 1,
          price: 129,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: 'Gold',
          length: 3,
          price: 109,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: 'Diamond',
          length: 6,
          price: 89,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
