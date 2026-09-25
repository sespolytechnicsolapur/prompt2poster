import React, { useState } from 'react';
import { Menu, X, Triangle, Sun, Moon, LogOut, LogIn, User, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export function Navbar({
  activePage,
  setActivePage,
  activeTopicTitle,
  theme,
  toggleTheme,
  contestant,
  onLogout,
  leaderboardVisible,
  isAdmin,
  setIsAdmin
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navTo = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  const showLeaderboardNav = leaderboardVisible || isAdmin;

  return (
    <header className="site-navbar relative z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="navbar-inner h-20 flex items-center justify-between border-b-2 border-border-strong border-dashed">
          {/* LOGO & BRAND */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navTo('home')}
          >
            <div className="w-10 h-10 bg-primary text-inverse rounded-xl flex items-center justify-center transform -rotate-3 group-hover:rotate-6 transition-transform shadow-sm">
              <Triangle size={20} strokeWidth={3} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <div className="text-xl font-extrabold font-display tracking-tight text-primary leading-none group-hover:text-accent transition-colors">
                Prompt2Poster
              </div>
              <div className="text-[0.65rem] font-bold text-muted uppercase tracking-wider mt-1 font-sans">
                AI Evaluation Engine
              </div>
            </div>
          </motion.div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navTo('home')}
              className={cn("nav-link-btn px-4 py-2 font-bold font-sans transition-colors rounded-sketchy hover:bg-surface-hover", activePage === 'home' ? 'text-accent bg-accent-subtle' : 'text-secondary')}
            >
              Overview
            </button>
            {showLeaderboardNav && (
              <button
                onClick={() => navTo('leaderboard')}
                className={cn("nav-link-btn px-4 py-2 font-bold font-sans transition-colors rounded-sketchy hover:bg-surface-hover", activePage === 'leaderboard' ? 'text-accent bg-accent-subtle' : 'text-secondary')}
              >
                Live Leaderboard
              </button>
            )}
            
            <div className="flex items-center gap-1 ml-2 pl-2 border-l-2 border-dashed border-border">
              <button
                onClick={() => navTo('organizer')}
                className={cn("nav-link-btn px-4 py-2 font-bold font-sans transition-colors rounded-sketchy hover:bg-surface-hover", activePage === 'organizer' ? 'text-accent bg-accent-subtle' : 'text-secondary')}
              >
                Organizer
              </button>
              {isAdmin && (
                <button
                  onClick={() => navTo('whitelist')}
                  className={cn("nav-link-btn px-4 py-2 font-bold font-sans transition-colors rounded-sketchy hover:bg-surface-hover", activePage === 'whitelist' ? 'text-accent bg-accent-subtle' : 'text-secondary')}
                >
                  Whitelist
                </button>
              )}
              {isAdmin && (
                <button 
                  onClick={() => {
                    if (setIsAdmin) setIsAdmin(false);
                    if (activePage === 'organizer') navTo('home');
                  }} 
                  className="p-2 text-danger opacity-70 hover:opacity-100 hover:bg-danger-subtle rounded-full transition-all" 
                  title="Lock Admin Session"
                >
                  <Lock size={16} />
                </button>
              )}
            </div>

            <div className="w-px h-6 bg-border mx-2" />

            {/* Contestant Actions */}
            {contestant ? (
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navTo('submit')}
                  className="btn btn-accent px-5 py-2 font-sans font-bold"
                >
                  Submit Poster
                </motion.button>
                <div className="flex items-center gap-2 pl-2">
                  <div className="flex items-center gap-1.5 text-secondary text-sm font-bold font-sans">
                    <User size={16} className="text-accent" />
                    <span>{contestant.name.split(' ')[0]}</span>
                  </div>
                  <button onClick={onLogout} className="p-2 text-muted hover:text-danger transition-colors rounded-full" title="Logout">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navTo('login')}
                className="btn btn-secondary px-5 py-2 font-heading font-bold flex items-center gap-2"
              >
                <LogIn size={16} />
                <span>Login</span>
              </motion.button>
            )}

            <div className="w-px h-6 bg-border mx-2" />

            {/* THEME */}
            <motion.button
              whileHover={{ rotate: 45 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-full border-2 border-border text-secondary hover:text-primary hover:border-border-strong transition-all bg-surface"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
          </nav>

          {/* MOBILE CONTROLS */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-secondary"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-primary"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b-2 border-dashed border-border bg-surface overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              <button
                onClick={() => navTo('home')}
                className={cn("text-left p-3 rounded-sketchy font-sans font-bold text-lg transition-colors", activePage === 'home' ? 'bg-accent-subtle text-accent' : 'text-primary hover:bg-surface-hover')}
              >
                Overview
              </button>
              {showLeaderboardNav && (
                <button
                  onClick={() => navTo('leaderboard')}
                  className={cn("text-left p-3 rounded-sketchy font-sans font-bold text-lg transition-colors", activePage === 'leaderboard' ? 'bg-accent-subtle text-accent' : 'text-primary hover:bg-surface-hover')}
                >
                  Live Leaderboard
                </button>
              )}

              <button
                onClick={() => navTo('organizer')}
                className={cn("text-left p-3 rounded-sketchy font-sans font-bold text-lg transition-colors", activePage === 'organizer' ? 'bg-accent-subtle text-accent' : 'text-primary hover:bg-surface-hover')}
              >
                Organizer
              </button>

              {isAdmin && (
                <button
                  onClick={() => navTo('whitelist')}
                  className={cn("text-left p-3 rounded-sketchy font-sans font-bold text-lg transition-colors", activePage === 'whitelist' ? 'bg-accent-subtle text-accent' : 'text-primary hover:bg-surface-hover')}
                >
                  Whitelist
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    if (setIsAdmin) setIsAdmin(false);
                    if (activePage === 'organizer') navTo('home');
                    setMobileOpen(false);
                  }}
                  className="text-left p-3 rounded-sketchy font-sans font-bold text-lg text-danger flex items-center gap-3 hover:bg-danger-subtle transition-colors"
                >
                  <Lock size={18} /> Lock Admin Session
                </button>
              )}

              <div className="h-px bg-border-strong border-dashed border-b-2 my-2" />

              {contestant ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 p-3 text-secondary font-sans">
                    <User size={18} />
                    <span>Logged in as <strong className="font-heading text-primary">{contestant.name}</strong></span>
                  </div>
                  <button
                    onClick={() => navTo('submit')}
                    className="btn btn-accent w-full p-4 font-sans font-bold text-lg"
                  >
                    Submit Poster
                  </button>
                  <button
                    onClick={() => { onLogout(); setMobileOpen(false); }}
                    className="btn btn-secondary w-full p-4 font-sans font-bold flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navTo('login')}
                  className="btn btn-primary w-full p-4 font-heading font-bold text-lg flex items-center justify-center gap-2"
                >
                  <LogIn size={18} />
                  <span>Login to Submit</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}