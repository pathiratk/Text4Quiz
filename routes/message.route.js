const express = require('express');
const router = express.Router();

const message_controller = require('../controllers/message.controller');

router.post('/', message_controller.sms);
module.exports = router;