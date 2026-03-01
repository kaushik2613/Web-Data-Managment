import express from 'express';
import { sendSessionEmailsToStudents } from '../controllers/sendEmailController.js';

const sendEmailRouter = express.Router();

sendEmailRouter.post('/send-email', sendSessionEmailsToStudents);

export default sendEmailRouter;