/**
 * VA Settings API Endpoints
 * GET, PATCH for global configuration management
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import VASettingsModel from '@/models/VASettings';
import type { VASettings } from '@/types/settings';

// ============================================================================
// GET - Fetch current settings
// ============================================================================

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const settings = await VASettingsModel.findOne().lean();

        if (!settings) {
            // Create default settings if none exist
            const defaultSettings = await VASettingsModel.create({
                updated_by: 'system',
            });
            
            return NextResponse.json({
                success: true,
                settings: {
                    id: defaultSettings._id.toString(),
                    ...defaultSettings.toObject(),
                },
            });
        }

        return NextResponse.json({
            success: true,
            settings: {
                id: settings._id.toString(),
                ...settings,
            },
        });
    } catch (error: any) {
        console.error('Failed to fetch VA settings:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// ============================================================================
// PATCH - Update settings (Admin only)
// ============================================================================

export async function PATCH(request: NextRequest) {
    const session = await verifyAuth();
    
    if (!session?.isAdmin) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 403 }
        );
    }

    try {
        await connectDB();

        const updates = await request.json();

        // Get current settings
        let settings = await VASettingsModel.findOne();

        if (!settings) {
            // Create with updates
            settings = await VASettingsModel.create({
                ...updates,
                updated_by: session.pilotId || session.id,
            });
        } else {
            // Update existing
            Object.assign(settings, updates);
            settings.updated_by = session.pilotId || session.id;
            await settings.save();
        }

        // Broadcast update to all connected clients
        // In production, use WebSocket or Supabase Realtime
        const settingsData = {
            id: settings._id.toString(),
            ...settings.toObject(),
        };

        return NextResponse.json({
            success: true,
            settings: settingsData,
            message: 'Settings updated successfully',
        });
    } catch (error: any) {
        console.error('Failed to update VA settings:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// ============================================================================
// POST - Reset to defaults (Admin only)
// ============================================================================

export async function POST(request: NextRequest) {
    const session = await verifyAuth();
    
    if (!session?.isAdmin) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 403 }
        );
    }

    try {
        await connectDB();

        // Delete existing settings
        await VASettingsModel.deleteMany({});

        // Create fresh default settings
        const settings = await VASettingsModel.create({
            updated_by: session.pilotId || session.id,
        });

        return NextResponse.json({
            success: true,
            settings: {
                id: settings._id.toString(),
                ...settings.toObject(),
            },
            message: 'Settings reset to defaults',
        });
    } catch (error: any) {
        console.error('Failed to reset VA settings:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
