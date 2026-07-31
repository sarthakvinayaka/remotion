import React from "react";

export const IconHashMap: React.FC<{ size?: number; color: string }> = ({ size = 48, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
);

export const IconQueue: React.FC<{ size?: number; color: string }> = ({ size = 48, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="9" width="5" height="6" rx="1" />
    <rect x="9.5" y="9" width="5" height="6" rx="1" />
    <rect x="17" y="9" width="5" height="6" rx="1" />
    <path d="M2 6v-1M9.5 6v-1M17 6v-1" />
  </svg>
);

export const IconLock: React.FC<{ size?: number; color: string }> = ({ size = 48, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

export const IconContainer: React.FC<{ size?: number; color: string }> = ({ size = 48, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l9 5-9 5-9-5 9-5z" />
    <path d="M3 7v10l9 5 9-5V7" />
    <path d="M12 12v10" />
  </svg>
);

export const IconCloud: React.FC<{ size?: number; color: string }> = ({ size = 48, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 18a4 4 0 01-1-7.9A5 5 0 0116 8a4.5 4.5 0 011 8.9" />
    <path d="M7 18h10" />
  </svg>
);

export const IconWarning: React.FC<{ size?: number; color: string }> = ({ size = 48, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l10 18H2L12 3z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="17.5" r="0.6" fill={color} />
  </svg>
);

export const IconClick: React.FC<{ size?: number; color: string }> = ({ size = 48, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3l1 17 3-4 3 5 2-1-3-5 5-1z" />
  </svg>
);

export const IconBox: React.FC<{ size?: number; color: string }> = ({ size = 48, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

export const IconBell: React.FC<{ size?: number; color: string }> = ({ size = 48, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 10a6 6 0 0112 0v4l2 3H4l2-3z" />
    <path d="M10 20a2 2 0 004 0" />
  </svg>
);
