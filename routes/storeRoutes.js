const express = require('express');
const multer = require('multer');
const path = require('path');
const { files, readJson, writeJson } = require('../utils/db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(requireAuth);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public/uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.png');
    cb(null, `${Date.now()}-${file.fieldname}-${req.session.user.id}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (/^image\/(gif|jpeg|png|webp|jpg)/.test(file.mimetype)) return cb(null, true);
    cb(new Error('อัปโหลดได้เฉพาะไฟล์รูป gif, jpg, jpeg, png หรือ webp'));
  }
});

function clampOpacity(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0.72;
  return Math.min(1, Math.max(0, num));
}

router.get('/', (req, res) => {
  const stores = readJson(files.stores);
  const store = stores.find((s) => s.id === req.session.user.storeId);
  if (!store) return res.status(404).json({ message: 'ไม่พบข้อมูลร้าน' });
  res.json({ store });
});

router.put('/', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'backgroundFile', maxCount: 1 }]), (req, res) => {
  const stores = readJson(files.stores);
  const index = stores.findIndex((s) => s.id === req.session.user.storeId);
  if (index === -1) return res.status(404).json({ message: 'ไม่พบข้อมูลร้าน' });

  const logoFile = req.files?.logo?.[0];
  const backgroundFile = req.files?.backgroundFile?.[0];

  stores[index] = {
    ...stores[index],
    storeName: req.body.storeName || stores[index].storeName,
    buttonColor: req.body.buttonColor || stores[index].buttonColor || '#24c8f3',
    glowColor: req.body.glowColor || stores[index].glowColor || req.body.buttonColor || stores[index].buttonColor || '#24c8f3',
    backgroundOpacity: clampOpacity(req.body.backgroundOpacity ?? stores[index].backgroundOpacity),
    backgroundImage: backgroundFile ? `/public/uploads/${backgroundFile.filename}` : (stores[index].backgroundImage || ''),
    logo: logoFile ? `/public/uploads/${logoFile.filename}` : stores[index].logo
  };

  delete stores[index].themeColor;

  writeJson(files.stores, stores);
  res.json({ message: 'อัปเดตร้านสำเร็จ', store: stores[index] });
});

router.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ message: error.message || 'อัปโหลดไฟล์ไม่สำเร็จ' });
  }
  next();
});

module.exports = router;
