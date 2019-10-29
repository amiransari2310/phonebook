const Joi = require('@hapi/joi');

const schema = Joi.object({
    _id: Joi.string(),
    name: Joi.string().required(),
    number: Joi.number().required(),
});

// Exporting Function That Validates Contact Paylod
module.exports = (payload) => schema.validate(payload);
