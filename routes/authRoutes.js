const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { files, readJson, writeJson } = require('../utils/db');
const { isValidEmail } = require('../utils/helpers');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword, storeName } = req.body;

    if (!username || !email || !password || !confirmPassword || !storeName) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'รหัสผ่านไม่ตรงกัน' });
    }

    const users = readJson(files.users);
    const stores = readJson(files.stores);
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      return res.status(409).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const storeId = uuidv4();
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const store = {
      id: storeId,
      ownerUserId: userId,
      storeName,
      logo: '',
      themeColor: '#24c8f3',
      backgroundImage: '',
      createdAt: now
    };

    const user = {
      id: userId,
      username,
      email,
      passwordHash,
      storeId,
      createdAt: now
    };

    stores.push(store);
    users.push(user);
    writeJson(files.stores, stores);
    writeJson(files.users, users);

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      storeId: user.storeId
    };

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user: req.session.user });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    const users = readJson(files.users);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      storeId: user.storeId
    };

    res.json({ message: 'เข้าสู่ระบบสำเร็จ', user: req.session.user });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'ออกจากระบบแล้ว' });
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

module.exports = router;
