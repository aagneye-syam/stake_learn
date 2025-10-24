import { NextRequest, NextResponse } from 'next/server';
import { rpcService } from '../../../../lib/rpcService';

export async function POST(request: NextRequest) {
  try {
    // Initialize default network configurations
    await rpcService.initializeDefaultRPCs();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Default network configurations initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing networks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize network configurations' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all network configurations
    const networks = await rpcService.getAllNetworkRPCs();
    
    return NextResponse.json({ 
      success: true, 
      networks 
    });
  } catch (error) {
    console.error('Error fetching networks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch network configurations' 
      },
      { status: 500 }
    );
  }
}
