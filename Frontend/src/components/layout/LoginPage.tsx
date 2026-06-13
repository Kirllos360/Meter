'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, Info } from 'lucide-react';
import { useAuthStore, ROLES } from '@/lib/mock-auth';
import { usePageStore } from '@/lib/router-store';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = usePageStore((s) => s.navigate);
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    // Simulate a brief loading state
    await new Promise((resolve) => setTimeout(resolve, 400));
    login(selectedRole);
    navigate('dashboard');
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/3 via-transparent to-transparent rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(163,255,18,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(163,255,18,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Login Card */}
        <Card className="glass-card neon-border border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            {/* Logo & Branding */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative mb-4"
              >
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg neon-glow-intense">
                  <Zap className="size-8" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-primary/10 blur-xl -z-10" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-2xl font-bold tracking-tight"
              >
                Meter <span className="text-primary">Pulse</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="text-sm text-muted-foreground mt-1"
              >
                Utility Metering & Billing Management
              </motion.p>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="space-y-4"
            >
              {/* Role Selector */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Sign in as
                </Label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@meterpulse.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <button className="text-xs text-primary hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className={cn(
                  'w-full h-11 text-base font-semibold mt-2 transition-all duration-200',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'neon-glow hover:neon-glow-intense'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="size-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </motion.div>

            {/* Demo hint */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="mt-6"
            >
              <Card className="bg-secondary/30 border-0 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Info className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1">Demo Mode</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Select any role from the dropdown and click <span className="text-primary font-medium">Sign In</span> to explore the dashboard with different permission levels.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </CardContent>
        </Card>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          &copy; {new Date().getFullYear()} Meter Verse. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
