import React, { useState, useEffect } from 'react';
import { X, Mail, Server, Key, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'custom';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
}

interface EmailSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EmailConfig) => void;
}

export function EmailSettings({ isOpen, onClose, onSave }: EmailSettingsProps) {
  const { t } = useLanguage();
  const [config, setConfig] = useState<EmailConfig>({
    provider: 'smtp',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    apiKey: '',
    fromEmail: '',
    fromName: 'Trello Clone'
  });

  useEffect(() => {
    // Load saved email config
    const saved = localStorage.getItem('email-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load email config:', error);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('email-config', JSON.stringify(config));
    
    onSave(config);
    onClose();
  };

  const providers = [
    { value: 'smtp', label: 'SMTP Server', icon: Server },
    { value: 'sendgrid', label: 'SendGrid', icon: Mail },
    { value: 'mailgun', label: 'Mailgun', icon: Shield },
    { value: 'custom', label: 'Custom API', icon: Key }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-auto my-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('email.settings')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('email.provider')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {providers.map((provider) => {
                const Icon = provider.icon;
                return (
                  <label
                    key={provider.value}
                    className={`flex items-center space-x-3 rtl:space-x-reverse p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      config.provider === provider.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value={provider.value}
                      checked={config.provider === provider.value}
                      onChange={(e) => setConfig(prev => ({ ...prev, provider: e.target.value as any }))}
                      className="sr-only"
                    />
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{provider.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('email.from.email')}
              </label>
              <input
                type="email"
                value={config.fromEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('email.from.name')}
              </label>
              <input
                type="text"
                value={config.fromName}
                onChange={(e) => setConfig(prev => ({ ...prev, fromName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          {config.provider === 'smtp' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">{t('email.smtp.settings')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email.smtp.host')}
                  </label>
                  <input
                    type="text"
                    value={config.smtpHost}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email.smtp.port')}
                  </label>
                  <input
                    type="number"
                    value={config.smtpPort}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email.smtp.username')}
                  </label>
                  <input
                    type="text"
                    value={config.smtpUser}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email.smtp.password')}
                  </label>
                  <input
                    type="password"
                    value={config.smtpPassword}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {(config.provider === 'sendgrid' || config.provider === 'mailgun' || config.provider === 'custom') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('email.api.key')}
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">{t('email.test.title')}</h4>
                <p className="text-sm text-blue-700">{t('email.test.description')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}