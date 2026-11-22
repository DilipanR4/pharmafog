const express = require('express');
const router = express.Router();
const {
  getUsers,
  toggleUserStatus,
  updateUserRole,
  getAuditLogs,
  getSystemStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.get('/audit-logs', getAuditLogs);
router.get('/status', getSystemStatus);

module.exports = router;
