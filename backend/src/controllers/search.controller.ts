import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Search files
export const searchFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      q: searchQuery, 
      category, 
      minPrice, 
      maxPrice, 
      isFree, 
      sortBy = 'relevance',
      page = 1,
      limit = 20 
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let whereConditions = ['1=1'];
    let queryParams: any[] = [];

    // Search query
    if (searchQuery) {
      whereConditions.push('(f.title LIKE ? OR f.description LIKE ? OR c.name LIKE ?)');
      const searchTerm = `%${searchQuery}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (category) {
      whereConditions.push('c.slug = ?');
      queryParams.push(category);
    }

    // Price filters
    if (isFree === 'true') {
      whereConditions.push('f.is_free = true');
    } else if (isFree === 'false') {
      whereConditions.push('f.is_free = false');
      
      if (minPrice) {
        whereConditions.push('f.price >= ?');
        queryParams.push(parseFloat(minPrice as string));
      }
      
      if (maxPrice) {
        whereConditions.push('f.price <= ?');
        queryParams.push(parseFloat(maxPrice as string));
      }
    }

    // Sorting
    let orderBy = 'f.created_at DESC';
    switch (sortBy) {
      case 'price_low':
        orderBy = 'f.price ASC';
        break;
      case 'price_high':
        orderBy = 'f.price DESC';
        break;
      case 'newest':
        orderBy = 'f.created_at DESC';
        break;
      case 'oldest':
        orderBy = 'f.created_at ASC';
        break;
      case 'popular':
        orderBy = 'purchase_count DESC, f.created_at DESC';
        break;
      case 'relevance':
      default:
        if (searchQuery) {
          orderBy = `
            CASE 
              WHEN f.title LIKE ? THEN 1
              WHEN f.description LIKE ? THEN 2
              WHEN c.name LIKE ? THEN 3
              ELSE 4
            END, f.created_at DESC
          `;
          const searchTerm = `%${searchQuery}%`;
          queryParams.unshift(searchTerm, searchTerm, searchTerm);
        }
        break;
    }

    // Main query
    const searchSql = `
      SELECT 
        f.*,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(purchase_stats.purchase_count, 0) as purchase_count
      FROM files f
      LEFT JOIN categories c ON f.category_id = c.id
      LEFT JOIN (
        SELECT 
          file_id, 
          COUNT(*) as purchase_count
        FROM purchases 
        WHERE status = 'completed'
        GROUP BY file_id
      ) purchase_stats ON f.id = purchase_stats.file_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countSql = `
      SELECT COUNT(*) as total
      FROM files f
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [files, countResult] = await Promise.all([
      query(searchSql, [...queryParams, parseInt(limit as string), offset]),
      query(countSql, queryParams.filter((_, index) => {
        // Remove the relevance sorting parameters from count query
        if (sortBy === 'relevance' && searchQuery) {
          return index >= 3; // Skip the first 3 relevance parameters
        }
        return true;
      }))
    ]);

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      status: 'success',
      data: {
        files: files || [],
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
          hasNext: parseInt(page as string) < totalPages,
          hasPrev: parseInt(page as string) > 1
        },
        filters: {
          searchQuery,
          category,
          minPrice,
          maxPrice,
          isFree,
          sortBy
        }
      }
    });
  } catch (error) {
    logger.error('Error searching files:', error);
    next(error);
  }
};

// Get search suggestions
export const getSearchSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q: searchQuery } = req.query;

    if (!searchQuery || (searchQuery as string).length < 2) {
      return res.json({
        status: 'success',
        data: { suggestions: [] }
      });
    }

    const suggestions = await query(`
      SELECT DISTINCT f.title
      FROM files f
      WHERE f.title LIKE ?
      ORDER BY f.title
      LIMIT 10
    `, [`%${searchQuery}%`]);

    res.json({
      status: 'success',
      data: {
        suggestions: suggestions.map(s => s.title)
      }
    });
  } catch (error) {
    logger.error('Error getting search suggestions:', error);
    next(error);
  }
};

// Get popular searches
export const getPopularSearches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This would typically come from a search analytics table
    // For now, we'll return some mock popular searches
    const popularSearches = [
      'resume template',
      'business plan',
      'logo design',
      'presentation template',
      'invoice template',
      'brochure design',
      'social media template',
      'website template'
    ];

    res.json({
      status: 'success',
      data: { popularSearches }
    });
  } catch (error) {
    logger.error('Error getting popular searches:', error);
    next(error);
  }
};