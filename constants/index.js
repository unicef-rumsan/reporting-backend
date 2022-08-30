module.exports = {
  ENV: {
    PRODUCTION: "production",
    DEVELOPMENT: "development",
    TEST: "test",
  },
  EMAIL_TEMPLATES: {
    USER_ADDED: {
      subject: "Welcome to our App.",
      html: `${__dirname}/../helpers/templates/user_added.html`,
    },
  },
};
