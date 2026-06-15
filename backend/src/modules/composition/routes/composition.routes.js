import express from 'express'

const router = express.Router()

router.post('/create', (req, res) => res.json({ message: 'Create composition - TODO' }))
router.get('/:id', (req, res) => res.json({ message: 'Get composition - TODO' }))

export default router
