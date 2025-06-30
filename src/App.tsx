import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { ProjectSelector } from './components/ProjectSelector';
import { Board } from './components/Board';
import { cleanupOldDrafts } from './utils/draftStorage';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Cleanup old drafts on app start
  useEffect(() => {
    cleanupOldDrafts();
  }, []);

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <ProjectProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <Header 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <ProjectSelector />
        <Board searchTerm={searchTerm} />
      </div>
    </ProjectProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;