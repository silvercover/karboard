import React, { useState } from 'react';
import { Search, Globe, User, LogOut, Settings } from 'lucide-react';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ProfileModal } from './ProfileModal';
import { EmailSettings } from './EmailSettings';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function Header({ searchTerm, onSearchChange }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, userAvatar, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);

  const toggleLanguage = () => {
    const newLang = language.code === 'en' ? languages.fa : languages.en;
    setLanguage(newLang);
  };

  const handleEmailConfigSave = (config: any) => {
    console.log('Email configuration saved:', config);
    // Here you would typically send this to your backend
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-2.5 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('app.title')}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="relative">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>
          
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm font-medium text-gray-700 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white/80 transition-all duration-200"
          >
            <Globe className="w-4 h-4" />
            <span>{t('language.switch')}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 rtl:space-x-reverse p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute top-full right-0 rtl:left-0 rtl:right-auto mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[10001] min-w-[180px]">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="font-medium text-gray-800">{user?.name}</div>
                  <div className="text-sm text-gray-600">{user?.email}</div>
                </div>
                
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left rtl:text-right hover:bg-gray-50 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <User className="w-4 h-4" />
                  <span>{t('profile')}</span>
                </button>

                <button
                  onClick={() => {
                    setShowEmailSettings(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left rtl:text-right hover:bg-gray-50 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Settings className="w-4 h-4" />
                  <span>{t('email.settings')}</span>
                </button>
                
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left rtl:text-right hover:bg-gray-50 transition-colors flex items-center space-x-2 rtl:space-x-reverse text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('auth.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      <EmailSettings
        isOpen={showEmailSettings}
        onClose={() => setShowEmailSettings(false)}
        onSave={handleEmailConfigSave}
      />
    </header>
  );
}