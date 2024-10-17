module.exports = {
  jwtSecret: 'b90294hijkfd2fdsaf',
  db: {
    connection: {
        host: 'host.docker.internal',
        user: 'duane197',
        password: 'Qwertymoon1',
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
