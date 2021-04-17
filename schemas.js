const joi = require("joi")

module.exports.productSchema = Joi.object({
    product: Joi.object({
        rating: Joi.number().required().min(1),
        imagePath: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required() 

    }).required()
})