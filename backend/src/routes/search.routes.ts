import express from 'express';
import {
  searchFiles,
  getSearchSuggestions,
  getPopularSearches
} from '../controllers/search.controller';

const router = express.Router();

// Search files
router.get('/', searchFiles);

// Get search suggestions
router.get('/suggestions', getSearchSuggestions);

// Get popular searches
router.get('/popular', getPopularSearches);

export default router;