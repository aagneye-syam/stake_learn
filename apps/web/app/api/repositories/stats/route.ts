import { NextRequest, NextResponse } from "next/server";
import { getRepositoryStats } from "@/services/repository.service";

// GET - Get repository statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await getRepositoryStats();
    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error fetching repository stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
