import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectAccess } from '../middleware/projectAccess.js';
import { getProjectChatMessageRepo } from '../repositories/index.js';
import { processMentions } from '../services/mentionService.js';

export const projectChatRouter = Router({ mergeParams: true });
projectChatRouter.use(requireAuth);

projectChatRouter.get('/', requireProjectAccess, async (req, res, next) => {
  try {
    const messages = await getProjectChatMessageRepo().find({
      where: { projectId: req.params.id },
      order: { createdAt: 'ASC' },
      relations: ['author'],
    });
    res.json({
      messages: messages.map((m) => ({
        id: m.id,
        message: m.message,
        createdAt: m.createdAt,
        editedAt: m.editedAt,
        authorId: m.authorId,
        authorUsername: m.author?.username,
      })),
    });
  } catch (err) {
    next(err);
  }
});

projectChatRouter.post('/', requireProjectAccess, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message required' });

    const repo = getProjectChatMessageRepo();
    const chatMessage = await repo.save(
      repo.create({ projectId: req.params.id, authorId: req.user.id, message })
    );

    await processMentions({
      message,
      authorId: req.user.id,
      authorUsername: req.user.username,
      contextLabel: `${req.project.name} project chat`,
      entityType: 'PROJECT',
      entityId: req.params.id,
    });

    res.status(201).json({ message: { ...chatMessage, authorUsername: req.user.username } });
  } catch (err) {
    next(err);
  }
});

projectChatRouter.patch('/:messageId', requireProjectAccess, async (req, res, next) => {
  try {
    const repo = getProjectChatMessageRepo();
    const chatMessage = await repo.findOne({ where: { id: req.params.messageId } });
    if (!chatMessage) return res.status(404).json({ error: 'Not found' });
    if (chatMessage.authorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    chatMessage.message = req.body.message;
    chatMessage.editedAt = new Date();
    await repo.save(chatMessage);
    res.json({ message: chatMessage });
  } catch (err) {
    next(err);
  }
});

projectChatRouter.delete('/:messageId', requireProjectAccess, async (req, res, next) => {
  try {
    const repo = getProjectChatMessageRepo();
    const chatMessage = await repo.findOne({ where: { id: req.params.messageId } });
    if (!chatMessage) return res.status(404).json({ error: 'Not found' });
    if (chatMessage.authorId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await repo.remove(chatMessage);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
