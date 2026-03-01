import express from 'express';
import { createSession, deleteSession, getAllSessions, getMyRegisteredSessions, joinSession, updateSession } from '../controllers/sessionsController.js';

const sessionRouter = express.Router(); 

sessionRouter.post('/create-session', createSession);
sessionRouter.get('/all/:tutorId', getAllSessions);
sessionRouter.patch('/:sessionId', updateSession);
sessionRouter.delete('/:sessionId', deleteSession);
sessionRouter.post('/:sessionId/join', joinSession);
sessionRouter.get('/student/:studentId/registered', getMyRegisteredSessions);

export default sessionRouter;