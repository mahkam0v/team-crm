export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  if (status === 500) console.error(err); // log full error server-side only
  res.status(status).json({ error: message });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Not found' });
};
