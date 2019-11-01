const { validateUserPayload, validateContactPayload, validateCartPayload } = require('../validators');

/**
 * Function To Valid Payload For POST/PUT Requests
 * @param {objcet} payload - Payload To Validate
 * @returns {object} Validation Result
 */
const validate = (payload, entity) => {
    let validationResponse;
    switch (entity) {
        case 'users':
            validationResponse = validateUserPayload(payload);
            break;
        case 'contacts':
            validationResponse = validateContactPayload(payload);
            break;
        default:
            validationResponse = {};
    }
    return validationResponse;
}

// Exporting Validtion Utility Methods
module.exports = {
    validate,
};