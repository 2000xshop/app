function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อน' });
  }
  next();
}

module.exports = { requireAuth };
