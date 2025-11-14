'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Card from '@/components/Card';
import { AuthGuard } from '@/components/AuthGuard';

interface EmailRecipient {
  id: string;
  email: string;
  name: string;
  active: boolean;
}

interface SearchSite {
  id: string;
  name: string;
  domain: string;
  active: boolean;
}

interface Settings {
  recipients: EmailRecipient[];
  searchSites: SearchSite[];
  timeWindow: number;
  maxArticles: number;
  relevanceThreshold: number;
  keywords: string;
  scheduleTime: string;
  summaryLength: string;
  model: string;
  includeImages: boolean;
  comparisonModel: string;
  maxTokens: number;
  temperature: number;
}

interface AvailableModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPer1kTokens: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [newRecipient, setNewRecipient] = useState({ email: '', name: '' });
  const [newSite, setNewSite] = useState({ name: '', domain: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const result = await response.json();
        const apiSettings = result.data?.settings;
        const models = result.data?.availableModels || [];
        const user = result.data?.user;
        
        // Check if user is admin
        setIsAdmin(user?.role === 'admin' || false);
        
        console.log('🔧 Available models from API:', models);
        console.log('🔧 User role:', user?.role, 'isAdmin:', user?.role === 'admin');
        setAvailableModels(models);
        
        // Transform API response to frontend format
        // Map summaryLength number to string
        const summaryLengthReverseMap: { [key: number]: string } = {
          50: 'short',
          100: 'medium',
          150: 'long'
        };
        
        const summaryLengthNum = apiSettings?.systemSettings?.summaryLength || 100;
        const summaryLengthStr = summaryLengthReverseMap[summaryLengthNum] || 'medium';
        
        console.log('🔧 Loading settings from API:', {
          searchSettings: apiSettings?.searchSettings,
          timeWindow: apiSettings?.searchSettings?.timeWindow
        });

        const transformedSettings: Settings = {
          recipients: apiSettings?.recipients?.map((r: any, idx: number) => ({
            id: idx.toString(),
            email: r.email,
            name: r.name,
            active: true
          })) || [],
          searchSites: apiSettings?.searchSettings?.sources?.map((domain: string, idx: number) => ({
            id: idx.toString(),
            name: domain.replace('.com', '').replace('.org', ''),
            domain: domain,
            active: true
          })) || [],
          timeWindow: apiSettings?.searchSettings?.timeWindow || 24,
          maxArticles: apiSettings?.searchSettings?.maxResults || 10,
          relevanceThreshold: apiSettings?.systemSettings?.relevancyThreshold || 0.2,
          keywords: apiSettings?.searchSettings?.query || '',
          scheduleTime: '06:00',
          summaryLength: summaryLengthStr,
          model: apiSettings?.systemSettings?.llmModel || 'gpt-4o',
          includeImages: true,
          comparisonModel: 'gpt-5.1',
          maxTokens: apiSettings?.systemSettings?.llmMaxTokens || 300,
          temperature: apiSettings?.systemSettings?.llmTemperature || 0.5
        };
        
        setSettings(transformedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Load defaults
      setSettings({
        recipients: [
          { id: '1', email: 'ashtekar@gmail.com', name: 'Ashish Ashtekar', active: true }
        ],
        searchSites: [
          { id: '1', name: 'Nature', domain: 'nature.com', active: true },
          { id: '2', name: 'Science Magazine', domain: 'science.org', active: true },
          { id: '3', name: 'Biology Research Papers', domain: 'biorxiv.org', active: true },
        ],
        timeWindow: 24,
        maxArticles: 10,
        relevanceThreshold: 0.2,
        keywords: 'synthetic biology, biotechnology, genetic engineering, CRISPR',
        scheduleTime: '06:00',
        summaryLength: 'medium',
        model: 'gpt-4o',
        includeImages: true,
        comparisonModel: 'gpt-5.1',
        maxTokens: 300,
        temperature: 0.5
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!settings) return;
    
    setSaving(true);
    try {
      // Transform frontend settings to API format
      // Map summaryLength string to number
      const summaryLengthMap: { [key: string]: number } = {
        'short': 50,
        'medium': 100,
        'long': 150
      };
      
      const systemSettings = {
        llmModel: settings.model,
        llmTemperature: settings.temperature,
        llmMaxTokens: settings.maxTokens,
        relevancyThreshold: settings.relevanceThreshold,
        summaryLength: summaryLengthMap[settings.summaryLength] || 100,
        targetAudience: 'college sophomore',
        includeCitations: true,
        emailTemplate: 'default'
      };

      // Transform search settings
      const searchSettings = {
        query: settings.keywords,
        maxResults: settings.maxArticles,
        timeWindow: settings.timeWindow,
        sources: settings.searchSites
          .filter(site => site.active)
          .map(site => site.domain)
      };

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemSettings, searchSettings })
      });
      
      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const result = await response.json();
        alert(`Failed to save settings: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  }

  async function addRecipient() {
    if (!settings || !newRecipient.email || !newRecipient.name) return;
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_recipient',
          recipient: {
            email: newRecipient.email,
            name: newRecipient.name,
            preferences: {
              frequency: 'daily',
              format: 'html'
            }
          }
        })
      });

      if (response.ok) {
        // Update local state
        setSettings({
          ...settings,
          recipients: [
            ...settings.recipients,
            {
              id: Date.now().toString(),
              email: newRecipient.email,
              name: newRecipient.name,
              active: true
            }
          ]
        });
        setNewRecipient({ email: '', name: '' });
        alert('Recipient added successfully!');
      } else {
        const result = await response.json();
        alert(`Failed to add recipient: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding recipient:', error);
      alert('Error adding recipient');
    }
  }

  async function removeRecipient(id: string) {
    if (!settings) return;
    
    const recipient = settings.recipients.find(r => r.id === id);
    if (!recipient) return;

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_recipient',
          recipient: {
            email: recipient.email
          }
        })
      });

      if (response.ok) {
        // Update local state
        setSettings({
          ...settings,
          recipients: settings.recipients.filter(r => r.id !== id)
        });
        alert('Recipient removed successfully!');
      } else {
        const result = await response.json();
        alert(`Failed to remove recipient: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error removing recipient:', error);
      alert('Error removing recipient');
    }
  }

  function toggleRecipient(id: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      recipients: settings.recipients.map(r =>
        r.id === id ? { ...r, active: !r.active } : r
      )
    });
  }

  function addSearchSite() {
    if (!settings || !newSite.name || !newSite.domain) return;
    
    setSettings({
      ...settings,
      searchSites: [
        ...settings.searchSites,
        {
          id: Date.now().toString(),
          name: newSite.name,
          domain: newSite.domain,
          active: true
        }
      ]
    });
    setNewSite({ name: '', domain: '' });
  }

  function removeSearchSite(id: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      searchSites: settings.searchSites.filter(s => s.id !== id)
    });
  }

  function toggleSearchSite(id: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      searchSites: settings.searchSites.map(s =>
        s.id === id ? { ...s, active: !s.active } : s
      )
    });
  }

  if (loading || !settings) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-900">
          <Header />
          <Navigation />
          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center text-slate-400">Loading...</div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  const activeSites = settings?.searchSites?.filter(s => s.active).length || 0;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-900">
        <Header />
        <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Email Recipients */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Email Recipients</h2>
              {!isAdmin && (
                <span className="text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded">
                  View Only (Admin Only)
                </span>
              )}
            </div>
            
            {isAdmin && (
              <div className="flex gap-3 mb-6">
                <input
                  type="email"
                  placeholder="Email address"
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={addRecipient}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
                >
                  Add
                </button>
              </div>
            )}

            <div className="space-y-3">
              {(settings?.recipients || []).map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between bg-slate-700 border border-slate-600 rounded p-4"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={recipient.active}
                      onChange={() => toggleRecipient(recipient.id)}
                      disabled={!isAdmin}
                      className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div>
                      <p className="text-white font-medium">{recipient.name}</p>
                      <p className="text-slate-400 text-sm">{recipient.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => removeRecipient(recipient.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Search Sites */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Search Sites</h2>
              {!isAdmin && (
                <span className="text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded">
                  View Only (Admin Only)
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Configure which websites should be searched for articles. At least one site must be active for search to work.
            </p>

            {isAdmin && (
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Display Name (e.g., LinkedIn)"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Domain (e.g., news.mit.edu, linkedin.com)"
                  value={newSite.domain}
                  onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={addSearchSite}
                  disabled={!newSite.name || !newSite.domain}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded font-medium disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {(settings?.searchSites || []).map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between bg-slate-700 border border-slate-600 rounded p-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={site.active}
                      onChange={() => toggleSearchSite(site.id)}
                      disabled={!isAdmin}
                      className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{site.name}</p>
                      <p className="text-slate-400 text-xs">{site.domain}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => removeSearchSite(site.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-blue-400 text-sm bg-blue-950 rounded p-3 border border-blue-900">
              <strong>{activeSites}</strong> of <strong>{settings.searchSites.length}</strong> sites are active.
            </p>
          </Card>

          {/* Search Settings */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Search Settings</h2>
              {!isAdmin && (
                <span className="text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded">
                  View Only (Admin Only)
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Time Window (hours)</label>
                <input
                  type="number"
                  value={settings.timeWindow}
                  onChange={(e) => setSettings({ ...settings, timeWindow: parseInt(e.target.value) })}
                  disabled={!isAdmin}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Max Articles (max: 100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxArticles}
                  onChange={(e) => {
                    const value = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
                    setSettings({ ...settings, maxArticles: value });
                  }}
                  disabled={!isAdmin}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 text-sm mb-2">Relevance Score Threshold</label>
              <select
                value={settings.relevanceThreshold}
                onChange={(e) => setSettings({ ...settings, relevanceThreshold: parseFloat(e.target.value) })}
                disabled={!isAdmin}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="0.8">🟢 Very Strict (0.8+) - Only the most relevant articles</option>
                <option value="0.6">🟡 High Quality (0.6+) - Recommended</option>
                <option value="0.4">🟠 Broader Coverage (0.4+)</option>
                <option value="0.2">🔵 Moderate (0.2+)</option>
                <option value="0.0">⚫ All Articles (0.0+) - No filtering</option>
              </select>
              <p className="text-slate-400 text-xs mt-2">
                Articles with a relevance score of {settings.relevanceThreshold} or higher will be included.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Keywords (comma-separated)</label>
              <input
                type="text"
                value={settings.keywords}
                onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
                placeholder="synthetic biology, CRISPR, gene editing"
                disabled={!isAdmin}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </Card>

          {/* System Settings */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">System Settings</h2>
              {!isAdmin && (
                <span className="text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded">
                  View Only (Admin Only)
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Schedule Time</label>
                <input
                  type="time"
                  value={settings.scheduleTime}
                  onChange={(e) => setSettings({ ...settings, scheduleTime: e.target.value })}
                  disabled={!isAdmin}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Summary Length</label>
                <select
                  value={settings.summaryLength}
                  onChange={(e) => setSettings({ ...settings, summaryLength: e.target.value })}
                  disabled={!isAdmin}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 text-sm mb-2">OpenAI Model</label>
              <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                disabled={!isAdmin}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description} (${model.costPer1kTokens}/1k tokens)
                  </option>
                ))}
              </select>
              <p className="text-slate-400 text-xs mt-2">
                Select the OpenAI model for generating summaries. Fine-tuned models offer specialized performance for specific tasks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="include-images"
                checked={settings.includeImages}
                onChange={(e) => setSettings({ ...settings, includeImages: e.target.checked })}
                disabled={!isAdmin}
                className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="include-images" className="text-slate-300 text-sm">
                Include images in email summaries
              </label>
            </div>
          </Card>

          {/* A/B Comparison Settings */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">🔬 A/B Comparison Settings</h2>
              {!isAdmin && (
                <span className="text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded">
                  View Only (Admin Only)
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Configure the advanced model used for A/B comparison testing. These settings affect the quality and cost of comparison summaries.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Advanced Model for Comparison</label>
                <select
                  value={settings.comparisonModel}
                  onChange={(e) => setSettings({ ...settings, comparisonModel: e.target.value })}
                  disabled={!isAdmin}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="gpt-5.1">GPT-5.1 (Latest & Most Capable)</option>
                  <option value="gpt-4o">GPT-4o (High Quality)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo (Balanced)</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet (Alternative)</option>
                </select>
                <p className="text-slate-400 text-xs mt-2">
                  Select the advanced model to compare against the current model in A/B tests.
                </p>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Max Tokens per Summary</label>
                <input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                  min="100"
                  max="1000"
                  disabled={!isAdmin}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-slate-400 text-xs mt-2">
                  Maximum length of comparison summaries (100-1000 tokens).
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 text-sm mb-2">Temperature: {settings.temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                disabled={!isAdmin}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>Focused (0.0)</span>
                <span>Balanced (0.5)</span>
                <span>Creative (1.0)</span>
              </div>
              <p className="text-slate-400 text-xs mt-2">
                Lower values produce more focused, consistent summaries. Higher values add more creativity and variety.
              </p>
            </div>

            <div className="bg-blue-950 border border-blue-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h4 className="text-white font-semibold mb-1">Cost Estimation</h4>
                  <p className="text-blue-300 text-sm mb-1">
                    Estimated cost per comparison session: $0.02-0.04 USD
                  </p>
                  <p className="text-slate-400 text-xs">
                    Based on 3 comparisons with {settings.maxTokens} tokens each using {settings.comparisonModel}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            {isAdmin ? (
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium text-lg disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-8 py-3">
                <p className="text-slate-400 text-sm">
                  Only administrators can modify settings. Contact an admin to make changes.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}

