// R-05: one error shape, correlation ID, no internals leaked to clients.
export function notFound(req, res, next) {
  next({ status: 404, code: "not_found", message: "Resource not found" });
}

export function errorHandler(logger = console) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, next) => {
    const status = err.status && err.status < 600 ? err.status : 500;
    const expected = status < 500;
    logger.error(
      JSON.stringify({ requestId: req.id, path: req.path, status, msg: err.message, stack: expected ? undefined : err.stack })
    );
    res.status(status).json({
      error: {
        code: expected ? err.code ?? "bad_request" : "internal_error",
        message: expected ? err.message : "Something went wrong",
        details: expected ? err.details : undefined,
        requestId: req.id,
      },
    });
  };
}
