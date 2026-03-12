import React, { useState, useEffect } from 'react';
import { useRunAudit } from '../hooks/useRunAudit';
import { useCWVSettings } from '../hooks/useCWVSettings';
import { MONITORED_PAGES as DEFAULT_PAGES, CWV_THRESHOLDS } from '../constants/pages';
import RunAuditButton from '../components/RunAuditButton';
import { Trash2, Plus, Download } from 'lucide-react';

interface MonitoredPage {
  id: string;
  url: string;
  name: string;
  shortName: string;
  template: string;
}

const CWVSettingsPage: React.FC = () => {
  const { runAudit, isRunning: isAuditRunning } = useRunAudit();
  const { settings, saveSettings } = useCWVSettings();
  const [pages, setPages] = useState<MonitoredPage[]>(DEFAULT_PAGES);
  const [strategy, setStrategy] = useState<'Desktop' | 'Mobile' | 'Both'>('Desktop');
  const [thresholds, setThresholds] = useState(CWV_THRESHOLDS);
  const [newPageUrl, setNewPageUrl] = useState('');
  const [newPageName, setNewPageName] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setPages(settings.pages || DEFAULT_PAGES);
      setStrategy(settings.strategy || 'Desktop');
      setThresholds(settings.thresholds || CWV_THRESHOLDS);
    }
  }, [settings]);

  const handleAddPage = () => {
    if (!newPageUrl.trim() || !newPageName.trim()) return;

    const newId = newPageName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const newPage: MonitoredPage = {
      id: newId,
      url: newPageUrl,
      name: newPageName,
      shortName: newPageName.substring(0, 10),
      template: 'custom',
    };

    setPages([...pages, newPage]);
    setNewPageUrl('');
    setNewPageName('');
  };

  const handleRemovePage = (pageId: string) => {
    setPages(pages.filter((p) => p.id !== pageId));
  };

  const handleSaveSettings = async () => {
    await saveSettings({
      pages,
      strategy,
      thresholds,
    });
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(
      {
        pages,
        strategy,
        thresholds,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr));
    element.setAttribute('download', 'cwv-settings.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">CWV Settings</h1>
          <p className="mt-2 text-slate-400">Configure monitoring and performance thresholds</p>
        </div>

        {/* Save Message */}
        {savedMessage && (
          <div className="mb-6 rounded-lg border border-green-800 bg-green-950 p-4 text-green-200">
            <p className="font-semibold">{savedMessage}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Monitored Pages Section */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">Monitored Pages</h2>

            {/* Pages List */}
            <div className="mb-6 space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between rounded-lg bg-slate-800 p-3"
                >
                  <div>
                    <p className="font-medium text-white">{page.name}</p>
                    <p className="text-xs text-slate-400">{page.url}</p>
                  </div>
                  <button
                    onClick={() => handleRemovePage(page.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Page */}
            <div className="space-y-3 rounded-lg bg-slate-800 p-4">
              <h3 className="font-medium text-slate-200">Add New Page</h3>
              <input
                type="text"
                placeholder="Page name"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="url"
                placeholder="Page URL"
                value={newPageUrl}
                onChange={(e) => setNewPageUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleAddPage}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Add Page
              </button>
            </div>
          </div>

          {/* Audit Configuration Section */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">Audit Configuration</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Strategy</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as 'Desktop' | 'Mobile' | 'Both')}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Desktop">Desktop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Schedule</label>
                <p className="text-sm text-slate-400">Monthly via GitHub Actions (1st of each month at 00:00 UTC)</p>
              </div>
            </div>
          </div>

          {/* Thresholds Section */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">Performance Thresholds</h2>

            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(thresholds).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-slate-800 p-4">
                  <h3 className="mb-3 font-medium text-white uppercase text-sm">{key}</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-slate-400">Good (≤)</label>
                      <input
                        type="number"
                        value={value.good}
                        onChange={(e) =>
                          setThresholds({
                            ...thresholds,
                            [key]: { ...value, good: parseFloat(e.target.value) },
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-2 py-1 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Poor (≥)</label>
                      <input
                        type="number"
                        value={value.poor}
                        onChange={(e) =>
                          setThresholds({
                            ...thresholds,
                            [key]: { ...value, poor: parseFloat(e.target.value) },
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-2 py-1 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Audit Section */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">Manual Audit</h2>
            <p className="mb-6 text-slate-400">Run an audit immediately instead of waiting for the scheduled monthly audit.</p>
            <RunAuditButton onClick={runAudit} isLoading={isAuditRunning} />
          </div>

          {/* Data Management Section */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">Data Management</h2>

            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Download size={18} />
                Export Settings
              </button>
              <p className="text-sm text-slate-400">
                Export all configuration and settings as JSON for backup or migration.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            className="w-full rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors"
          >
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default CWVSettingsPage;
