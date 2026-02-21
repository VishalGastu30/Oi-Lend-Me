import { NextResponse } from 'next/server';
import { z } from 'zod';

type ErrorResponse = {
  error: string;
  details?: unknown;
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  const body: ErrorResponse = { error: message };
  if (details && process.env.NODE_ENV !== 'production') {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403);
}

export function notFoundResponse(message = 'Not Found') {
  return errorResponse(message, 404);
}

export async function parseBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<{ data?: T; error?: ReturnType<typeof errorResponse> }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return { 
        error: errorResponse('Invalid request data', 400, result.error.format()) 
      };
    }
    
    return { data: result.data };
  } catch (e) {
    return { error: errorResponse('Invalid JSON body', 400) };
  }
}
