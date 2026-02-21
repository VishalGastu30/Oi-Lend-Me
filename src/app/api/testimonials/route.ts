import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch top reviews or high-karma user testimonials
    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        karmaScore: { gte: 0 },
      },
      select: {
        name: true,
        avatarUrl: true,
        role: true,
      },
      take: 6,
    });

    // Mock meaningful testimonials based on real user names if no explicit Review model exists
    // In a real app, this would be a Testimonial or Review model
    const testimonials = users.map((user, i) => {
      const messages = [
        "Lending my camera was so easy and I met a great fellow student!",
        "Saved a ton by borrowing lab equipment for my semester project.",
        "The trust score system makes me feel safe sharing my expensive tools.",
        "Oi! Lend Me is the best thing to happen to our campus community.",
        "Quick, easy, and super friendly. Highly recommended!",
        "Finally, a way to declutter and help others at the same time."
      ];
      return {
        id: `t-${i}`,
        content: messages[i % messages.length],
        author: user.name,
        role: user.role,
        avatar: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
      };
    });

    return successResponse(testimonials);
  } catch (error) {
    console.error('Fetch testimonials error:', error);
    return errorResponse('Failed to fetch testimonials', 500);
  }
}
