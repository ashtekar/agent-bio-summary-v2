import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/services/SettingsService';
import { SystemSettings } from '@/types/agent';

export async function GET() {
  try {
    const settings = await settingsService.getAllSettings();
    const availableModels = settingsService.getAvailableModels();

    return NextResponse.json({
      success: true,
      data: {
        settings,
        availableModels
      }
    });

  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch settings'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemSettings }: { systemSettings: Partial<SystemSettings> } = body;

    if (!systemSettings) {
      return NextResponse.json({
        success: false,
        error: 'systemSettings is required'
      }, { status: 400 });
    }

    // Validate model configuration
    const availableModels = settingsService.getAvailableModels();
    const modelIds = availableModels.map(m => m.id);
    
    if (systemSettings.llmModel && !modelIds.includes(systemSettings.llmModel)) {
      return NextResponse.json({
        success: false,
        error: `Invalid model: ${systemSettings.llmModel}. Available models: ${modelIds.join(', ')}`
      }, { status: 400 });
    }

    // Validate temperature
    if (systemSettings.llmTemperature !== undefined && 
        (systemSettings.llmTemperature < 0 || systemSettings.llmTemperature > 2)) {
      return NextResponse.json({
        success: false,
        error: 'Temperature must be between 0 and 2'
      }, { status: 400 });
    }

    // Validate max tokens
    if (systemSettings.llmMaxTokens !== undefined && 
        systemSettings.llmMaxTokens < 1) {
      return NextResponse.json({
        success: false,
        error: 'Max tokens must be greater than 0'
      }, { status: 400 });
    }

    await settingsService.updateSystemSettings(systemSettings);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings'
    }, { status: 500 });
  }
}

