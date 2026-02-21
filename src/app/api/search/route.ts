import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { NextRequest } from 'next/server';

interface SearchResult {
  item: any;
  relevanceScore: number;
  distance: number | null;
}

// Haversine formula to calculate distance in KM
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// --- NLP Utilities ---
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
  'at', 'from', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'to', 'of', 'in', 'on', 'i', 'me', 'my', 'myself', 'we', 'our',
  'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would',
  'should', 'could', 'ought', 'i\'m', 'you\'re', 'he\'s', 'she\'s',
  'it\'s', 'we\'re', 'they\'re', 'hasn\'t', 'haven\'t', 'hadn\'t',
  'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'can\'t', 'couldn\'t',
  'don\'t', 'doesn\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'shan\'t',
  'shouldn\'t', 'mustn\'t', 'needn\'t', 'daren\'t', 'hasn\'t', 'haven\'t',
  'need', 'want', 'get', 'find', 'looking', 'someone', 'please', 'can'
]);

function preprocessQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word))
    .map(word => {
      // Very basic stemming (remove trailing 's', 'es' if long enough)
      if (word.length > 4) {
        if (word.endsWith('es')) return word.slice(0, -2);
        if (word.endsWith('s')) return word.slice(0, -1);
      }
      return word;
    });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const minPrice = parseFloat(searchParams.get('minPrice') || '0') || 0;
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999') || 999999;
  const userLat = parseFloat(searchParams.get('lat') || '0');
  const userLon = parseFloat(searchParams.get('lon') || '0');
  const maxDistance = parseFloat(searchParams.get('radius') || '100'); // km
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  try {
    const originalQuery = query.trim().toLowerCase();
    const keywords = preprocessQuery(originalQuery);
    
    // Build where clause
    const where: any = {};

    // Only apply price filter if explicitly requested
    if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
      where.price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    if (category && category !== 'All Items') {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (keywords.length > 0) {
      // "NLP Style": Match items that contain ANY of the keywords
      where.OR = keywords.flatMap(kw => [
        { name: { contains: kw, mode: 'insensitive' } },
        { description: { contains: kw, mode: 'insensitive' } },
      ]);
    } else if (originalQuery) {
        // Fallback for very short queries that might be filtered as stop words
        where.OR = [
            { name: { contains: originalQuery, mode: 'insensitive' } },
            { description: { contains: originalQuery, mode: 'insensitive' } }
        ];
    }

    // Fetch items
    const items = await prisma.item.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            karmaScore: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    // Calculate relevance scores
    const results: SearchResult[] = items.map((item: any) => {
      let score = 0;
      
      const name = item.name.toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = item.category.toLowerCase();

      // 1. Exact Phrase Match (Highest weight)
      if (originalQuery && name.includes(originalQuery)) {
          score += 100;
          if (name === originalQuery) score += 50;
      }

      // 2. Keyword Matches
      if (keywords.length > 0) {
          keywords.forEach(kw => {
              // Priority: Name > Category > Description
              if (name === kw) score += 80;
              else if (name.startsWith(kw)) score += 40;
              else if (name.includes(kw)) score += 20;

              if (cat.includes(kw)) score += 15;
              if (desc.includes(kw)) score += 5;
          });
          
          // Boost based on % of keywords matched
          const matchedKeywordsCount = keywords.filter(kw => 
              name.includes(kw) || desc.includes(kw) || cat.includes(kw)
          ).length;
          score += (matchedKeywordsCount / keywords.length) * 50;
      }

      // 3. Availability boost
      if (item.status === 'AVAILABLE') score += 10;

      // 4. Karma boost
      if (item.owner && item.owner.karmaScore > 100) {
          score += Math.min(10, item.owner.karmaScore / 100);
      }

      // 5. Distance Calculation
      let distance = null;
      if (userLat && userLon && item.latitude && item.longitude) {
        distance = getDistance(userLat, userLon, item.latitude, item.longitude);
      } else if (userLat && userLon && item.owner && item.owner.latitude && item.owner.longitude) {
        distance = getDistance(userLat, userLon, item.owner.latitude, item.owner.longitude);
      }

      return { item, relevanceScore: score, distance };
    });

    // Filter by distance if requested
    const filteredResults = results.filter(res => {
      if (userLat && userLon && maxDistance && res.distance !== null) {
        return res.distance <= maxDistance;
      }
      return true;
    });

    // Sort by relevance (and distance if provided)
    filteredResults.sort((a, b) => {
      if (originalQuery) {
        // If sorting by relevance, distance should be a tie-breaker
        if (Math.abs(b.relevanceScore - a.relevanceScore) > 1) {
            return b.relevanceScore - a.relevanceScore;
        }
      }
      
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return 0;
    });

    const total = filteredResults.length;
    const paginatedItems = filteredResults.slice(skip, skip + limit).map(r => ({
      ...r.item,
      distance: r.distance,
      relevance: Math.round(r.relevanceScore)
    }));

    // Suggestions logic (simpler/faster)
    const suggestions = keywords.length > 0 ? await prisma.item.findMany({
      where: {
        OR: keywords.map(kw => ({ name: { contains: kw, mode: 'insensitive' } }))
      },
      select: { name: true },
      take: 5,
      distinct: ['name'],
    }) : [];

    return successResponse({
      items: paginatedItems,
      suggestions: suggestions.map(s => s.name),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return errorResponse('Search failed', 500);
  }
}
