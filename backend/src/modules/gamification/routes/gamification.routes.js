import express from 'express'

const router = express.Router()

router.get('/achievements', (req, res) => res.json({ message: 'Get achievements - TODO' }))
router.get('/leaderboard', (req, res) => res.json({ message: 'Get leaderboard - TODO' }))

export default router
