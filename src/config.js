module.exports = {
  jwtSecret: 'b90294hijkfd2fdsaf',
  db: {
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'qwerty123',
      database: 'pizza',
      connectTimeout: 60000,
    },
    listPerPage: 10,
  },
  factory: {
    url: 'https://pizza-factory.cs329.click',
    apiKey: 'd2ec81a4af3742ceb473bfb3cac36ba8',
  },
};
