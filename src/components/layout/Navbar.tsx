'use client';

import { useState } from 'react';
import { Menu, Sun, Moon, Monitor, Globe } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth, useLanguage } from '@/contexts';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const themes = [
    { value: 'light', icon: Sun, label: t('profile.lightMode') },
    { value: 'dark', icon: Moon, label: t('profile.darkMode') },
    { value: 'system', icon: Monitor, label: t('profile.systemMode') },
  ];

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1" />

      {/* Settings Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 p-2 hover:bg-muted rounded-xl transition-colors"
        >
          {user && (
            <Image 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`}
              alt={user.displayName}
              width={36}
              height={36}
              className="rounded-full border-2 border-primary/20"
            />
          )}
        </button>

        {showSettings && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowSettings(false)}
            />
            <div className={cn(
              "absolute top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-4 space-y-4 animate-fadeIn",
              language === 'ar' ? 'left-0' : 'right-0'
            )}>
              {/* Theme Selection */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('profile.theme')}</p>
                <div className="flex gap-2">
                  {themes.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={cn(
                          "flex-1 p-2 rounded-lg flex flex-col items-center gap-1 transition-all text-xs",
                          theme === t.value 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        )}
                      >
                        <Icon size={18} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('profile.language')}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all",
                      language === 'en' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    <Globe size={16} />
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('ar')}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all",
                      language === 'ar' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    <Globe size={16} />
                    العربية
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
