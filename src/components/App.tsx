import { LayoutDashboard, BookOpen, TrendingUp, Calculator, BarChart3, User, LogOut, Search, MessageSquare, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Pages
import Dashboard from './Dashboard';
import Subjects from './Subjects';
import CourseView from './CourseView';
import Simulators from './Simulators';
import ProgressPage from './ProgressPage';
import Profile from './Profile';
import FloatChat from './FloatChat';
