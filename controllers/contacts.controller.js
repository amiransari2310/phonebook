const {
    responseHandler: { sendSuccessResponse, sendErrorResponse, } = {},
    validationUtil: { validate } = {},
    logUtil: { log } = {},
} = require('../utils');
const { authHelper } = require('../helpers');
const { crudService } = require('../services');
const {
    listDataFromDb,
    createDataInDb,
    getDataFromDb,
    updateDataInDb,
    removeDataFromDb,
} = crudService;

/**
 * Handles Request To Return All Contacts Based On Params
 */
const listContacts = async (req, res) => {
    try {
        const { filter, sort, select, page, count, all } = req.query;
        log('info', {
            message: `Fetching All Contacts`,
            params: req.query,
            timeStamp: new Date().toString()
        });
        const userObject = authHelper.getUserObject(req);
        const { _id: user, role } = userObject;
        const defaultFilters = all === 'true' && role === 'admin' ? {} : { user };
        let sortOn;
        if (sort) {
            const [key, val] = sort.trim()[0] === '-' ? [sort.trim().substr(1), -1] : [sort, 1];
            sortOn = {};
            sortOn[key] = val;
        }
        const skip = count && page ? count * page : 0;
        const query = filter ? { ...JSON.parse(filter), ...defaultFilters } : { ...defaultFilters };
        const selecteOrExclude = select ? select.replace(/\,/g, ' ') : '';
        const data = await listDataFromDb(query, sortOn, selecteOrExclude, skip, count, 'contacts');
        sendSuccessResponse(
            { req, res },
            'ok',
            data && data.length > 0 ? 200 : 204,
            data,
            data && data.length > 0 ? 'Contacts Records Fetched Successfully.' : 'No Records Found For Contacts.'
        );
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Fetching Contacts Records.');
    }
}

/**
 * Request To Create A Contact
 */
const createContact = async (req, res) => {
    try {
        const { error } = validate(req.body, 'contacts');
        const [isValid, errors] = [!error, error];
        if (isValid) {
            log('info', {
                message: `Creating Contact`,
                payload: JSON.stringify(req.body),
                timeStamp: new Date().toString()
            });
            const userObject = authHelper.getUserObject(req);
            const { _id: user } = userObject;
            const data = await createDataInDb({ user, ...req.body }, 'contacts');
            sendSuccessResponse({ req, res }, 'ok', 201, data, 'Contacts Record Added Successfully.');
        } else {
            sendErrorResponse({ req, res }, 'badRequest', 400, errors, 'Invalid Contact Payload.');
        }
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Creating Contacts Record.');
    }
}

/**
 * Handles Request To Return A Contact Based On Input Id i.e Route Param
 */
const getContact = async (req, res) => {
    try {
        log('info', {
            message: `Get Contact By Id`,
            id: req.params.id,
            timeStamp: new Date().toString()
        });
        const data = await getDataFromDb(req.params.id, '', 'contacts');
        sendSuccessResponse(
            { req, res },
            'ok',
            data ? 200 : 204,
            data,
            data ? 'Contacts Record Fetched Successfully.' : `No Record Found For Id: '${req.params.id}' In Contacts.`
        );
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Fetchig Contacts Record.');
    }
}

/**
 * Handles Request To Update A Contact
 */
const updateContact = async (req, res) => {
    try {
        const isExist = await getDataFromDb(req.params.id, '', 'contacts');
        let data = null;
        if (!isExist) {
            sendSuccessResponse(
                { req, res },
                'ok',
                204,
                {},
                `No Record Found For Id: '${req.params.id}' In Contacts.`
            );
        } else {
            const { error } = validate(req.body, 'contacts');
            const [isValid, errors] = [!error, error];
            if (isValid) {
                log('info', {
                    message: `Update Contact By Id`,
                    id: req.params.id,
                    payload: JSON.stringify(req.body),
                    timeStamp: new Date().toString()
                });
                data = await updateDataInDb(req.params.id, req.body, 'contacts');
                sendSuccessResponse(
                    { req, res },
                    'ok',
                    200,
                    data,
                    `Contacts Record With Id: '${req.params.id}' Updated Successfully In Contacts.`
                );
            } else {
                sendErrorResponse({ req, res }, 'badRequest', 400, errors, 'Invalid Contact Payload.');
            }
        }
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Updating Contacts Record.');
    }
}

/**
 * Handles Request To Remove A Contacts Based On Input Id i.e Route Param
 */
const removeContact = async (req, res) => {
    try {
        const isExist = await getDataFromDb(req.params.id, '', 'contacts');
        let data = null;
        if (isExist) {
            log('info', {
                message: `Remove Contact By Id`,
                id: req.params.id,
                timeStamp: new Date().toString()
            });
            data = await removeDataFromDb(req.params.id, 'contacts');
        }
        sendSuccessResponse(
            { req, res },
            'ok',
            isExist ? 200 : 204,
            isExist ? data : {},
            isExist ? `Contacts Record With Id: '${req.params.id}' Deleted Successfully In Contacts.` : `No Record Found For Id: '${req.params.id}' In Contacts.`
        );
    } catch (err) {
        sendErrorResponse({ req, res }, 'error', 500, err, 'Error While Deleting Contacts Record.');
    }
}

// Exporting Request Handlers
module.exports = {
    listContacts,
    createContact,
    getContact,
    updateContact,
    removeContact,
}