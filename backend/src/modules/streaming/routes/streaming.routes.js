import express from 'express';
import { StreamingController } from '../controllers/streaming.controller.js';
import { TrackController } from '../controllers/track.controller.js';
import { authenticate } from '../../../common/middleware/auth.middleware.js';
import { authorize } from '../../../common/middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/tracks', StreamingController.getAllTracks);
router.get('/tracks/most-played', StreamingController.getMostPlayed);
router.get('/tracks/search', StreamingController.searchTracks);
router.get('/tracks/artist/:artist', StreamingController.getByArtist);
router.get('/tracks/difficulty/:difficulty', StreamingController.getByDifficulty);

// Auth routes
router.post('/tracks/:trackId/play', authenticate, StreamingController.playTrack);
router.get('/recently-played', authenticate, StreamingController.getRecentlyPlayed);
router.post('/tracks/:trackId/favorite', authenticate, StreamingController.toggleFavorite);
router.get('/favorites', authenticate, StreamingController.getFavorites);

// Admin/Teacher only - upload
router.post(
  '/tracks/upload/audio',
  authenticate,
  authorize('teacher', 'admin'),
  TrackController.uploadAudio
);
router.post(
  '/tracks/upload/video',
  authenticate,
  authorize('teacher', 'admin'),
  TrackController.uploadVideo
);
router.delete('/tracks/:id', authenticate, authorize('admin'), TrackController.deleteTrack);

export default router;
