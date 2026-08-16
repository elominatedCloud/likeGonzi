import { NextResponse } from "next/server";
import type { ApiError, ApiSuccess } from "@/types/story-api";

export function ok<T>(data: T, status = 200) {
  const body: ApiSuccess<T> = { ok: true, data };
  return NextResponse.json(body, { status });
}

export function fail(code: string, message: string, status = 400) {
  const body: ApiError = { ok: false, error: { code, message } };
  return NextResponse.json(body, { status });
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
