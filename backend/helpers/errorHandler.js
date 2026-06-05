/**
 * Global error handling middleware and route wrappers.
 *
 * @module helpers/errorHandler
 */

/**
 * Wraps a route handler so sync throws and async rejections are passed to
 * the global error handler instead of crashing the server.
 *
 * @param {import('express').RequestHandler} fn
 * @returns {import('express').RequestHandler}
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        try {
            const result = fn(req, res, next);
            if (result instanceof Promise) {
                result.catch(next);
            }
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Returns 404 JSON for API routes that do not exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function notFoundHandler(req, res) {
    res.status(404).json({ error: 'Route not found' });
}

/**
 * Central error handler — must be registered last in app.js.
 * Maps known error types to safe JSON responses so the app never crashes.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function globalErrorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
    }

    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'A record with these values already exists' });
    }

    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Cannot complete operation due to linked records' });
    }

    const status = err.status || err.statusCode || 500;
    const message = status === 500 ? 'Internal server error' : err.message;

    res.status(status).json({ error: message });
}
