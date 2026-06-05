/**
 * Small helpers for sending consistent HTTP responses from route handlers.
 *
 * @module helpers/response
 */

/**
 * Sends a 400 Bad Request with a validation error message.
 *
 * @param {import('express').Response} res
 * @param {{ error: string }} validationError
 */
export function sendValidationError(res, validationError) {
    res.status(400).json(validationError);
}
