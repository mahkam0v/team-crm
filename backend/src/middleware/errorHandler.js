import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  // malformed UUID in a URL param / request body — treat as not found, not a 500
  if (err?.code === '22P02') {
    return res.status(404).json({ error: 'Not found' });
  }

  // duplicate unique key / unique constraint
  if (err?.code === '23505') {
    return res.status(409).json({ error: 'This record already exists' });
  }

  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 20MB)' : err.message;
    return res.status(status).json({ error: message });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  if (status === 500) console.error(err); // log full error server-side only
  res.status(status).json({ error: message });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Not found' });
};
