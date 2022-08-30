const Joi = require("joi");

const GooseJoi = {
  id(description, example) {
    let id = Joi.string().required();
    id = description
      ? id.description(description)
      : id.description("Resource identifier");
    id = example ? id.example(example) : id;
    return Joi.object({ id });
  },
};

module.exports = GooseJoi;
