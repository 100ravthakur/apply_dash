const r = require('express').Router();
const multer = require('multer');
const c = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'];
    cb(ok.includes(file.mimetype) ? null : new Error('Only PDF/DOCX/TXT allowed'), ok.includes(file.mimetype));
  },
});
r.use(protect);
r.post('/upload', upload.single('resume'), c.upload);
r.get('/info', c.getInfo);
module.exports = r;
