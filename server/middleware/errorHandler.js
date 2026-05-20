const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message);
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.code === 11000) { status = 400; message = `${Object.keys(err.keyValue)[0]} already exists`; }
  if (err.name === 'CastError') { status = 400; message = 'Invalid ID'; }
  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
