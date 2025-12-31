'use client';

import { useState } from 'react';
import { useAuth, useLanguage } from '@/contexts';
import { X, User, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface StudentProfileSetupProps {
  onComplete: () => void;
}

export function StudentProfileSetup({ onComplete }: StudentProfileSetupProps) {
  const { user, updateProfile } = useAuth();
  const { language } = useLanguage();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [studentCode, setStudentCode] = useState(user?.studentCode || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  // Arabic character regex
  const arabicRegex = /^[\u0600-\u06FF\s]+$/;

  const validate = (): boolean => {
    const newErrors: { name?: string; code?: string } = {};

    if (!displayName.trim()) {
      newErrors.name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    } else if (!arabicRegex.test(displayName.trim())) {
      newErrors.name = language === 'ar' ? 'يجب أن يكون الاسم بالعربية فقط' : 'Name must be in Arabic only';
    }

    if (!studentCode.trim()) {
      newErrors.code = language === 'ar' ? 'كود الطالب مطلوب' : 'Student code is required';
    } else if (!/^\d{6}$/.test(studentCode.trim())) {
      newErrors.code = language === 'ar' ? 'يجب أن يكون الكود 6 أرقام' : 'Code must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        studentCode: studentCode.trim(),
      });
      toast.success(language === 'ar' ? 'تم حفظ الملف الشخصي' : 'Profile saved successfully');
      onComplete();
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full p-8 border border-border animate-fadeIn">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {language === 'ar' ? 'أكمل ملفك الشخصي' : 'Complete Your Profile'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' 
              ? 'يرجى إدخال اسمك الحقيقي وكود الطالب'
              : 'Please enter your real name and student code'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {language === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={language === 'ar' ? 'أحمد محمد علي' : 'Ahmed Mohamed Ali'}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                dir="rtl"
              />
            </div>
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {language === 'ar' ? 'كود الطالب (6 أرقام)' : 'Student Code (6 digits)'}
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono text-lg tracking-widest"
              />
            </div>
            {errors.code && <p className="text-destructive text-sm mt-1">{errors.code}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading 
              ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') 
              : (language === 'ar' ? 'حفظ والمتابعة' : 'Save & Continue')}
          </button>
        </form>
      </div>
    </div>
  );
}
