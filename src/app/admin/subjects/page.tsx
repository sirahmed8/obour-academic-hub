'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useLanguage } from '@/contexts';
import { AppShell } from '@/components/layout/AppShell';
import { Plus, Trash2, BookOpen, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Subject } from '@/types';

const ICON_OPTIONS = ['BookOpen', 'Cpu', 'Calculator', 'FlaskConical', 'Globe', 'Stethoscope', 'Briefcase', 'Music', 'Palette'];
const COLOR_OPTIONS = [
  { label: 'Blue', value: 'bg-blue-500' },
  { label: 'Red', value: 'bg-red-500' },
  { label: 'Green', value: 'bg-emerald-500' },
  { label: 'Purple', value: 'bg-purple-500' },
  { label: 'Orange', value: 'bg-orange-500' },
  { label: 'Pink', value: 'bg-pink-500' },
  { label: 'Indigo', value: 'bg-indigo-500' },
  { label: 'Cyan', value: 'bg-cyan-500' },
];

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    profName: '',
    description: '',
    icon: 'BookOpen',
    color: 'bg-blue-500'
  });

  useEffect(() => {
    const q = query(collection(db, 'subjects'), orderBy('orderIndex'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.profName) {
      toast.error(language === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'subjects'), {
        ...formData,
        createdAt: new Date().toISOString(),
        orderIndex: subjects.length
      });
      toast.success(language === 'ar' ? 'تم إنشاء المادة بنجاح' : 'Subject created successfully');
      setFormData({ name: '', profName: '', description: '', icon: 'BookOpen', color: 'bg-blue-500' });
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل الإنشاء' : 'Failed to create');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    
    try {
      await deleteDoc(doc(db, 'subjects', id));
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
          <BookOpen className="text-primary" />
          {t('admin.subjects')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-2xl border border-border sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                {language === 'ar' ? 'إضافة مادة جديدة' : 'Add New Subject'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'اسم المادة' : 'Subject Name'}</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-lg border border-border px-4 py-2 bg-background"
                    placeholder={language === 'ar' ? 'علوم الحاسب' : 'Computer Science'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'اسم الدكتور' : 'Professor Name'}</label>
                  <input 
                    type="text" 
                    value={formData.profName}
                    onChange={e => setFormData({...formData, profName: e.target.value})}
                    className="w-full rounded-lg border border-border px-4 py-2 bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'الوصف' : 'Description'}</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full rounded-lg border border-border px-4 py-2 bg-background h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'الأيقونة' : 'Icon'}</label>
                    <div className="grid grid-cols-3 gap-2 p-2 border border-border rounded-lg max-h-32 overflow-y-auto">
                      {ICON_OPTIONS.map(iconName => {
                        const IconComp = (Icons as any)[iconName];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData({...formData, icon: iconName})}
                            className={cn(
                              "p-2 rounded-md flex items-center justify-center transition-colors",
                              formData.icon === iconName ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                            )}
                          >
                            <IconComp className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'اللون' : 'Color'}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_OPTIONS.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({...formData, color: color.value})}
                          className={cn(
                            "w-8 h-8 rounded-full ring-2 ring-offset-2 transition-all",
                            color.value,
                            formData.color === color.value ? 'ring-primary scale-110' : 'ring-transparent opacity-70 hover:opacity-100'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all"
                >
                  {language === 'ar' ? 'إنشاء المادة' : 'Create Subject'}
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">
              {language === 'ar' ? 'المواد الحالية' : 'Existing Subjects'} ({subjects.length})
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                {language === 'ar' ? 'لا توجد مواد. أنشئ واحدة للبدء.' : 'No subjects found. Create one to get started.'}
              </div>
            ) : (
              <div className="grid gap-4">
                {subjects.map(subject => {
                  const IconComp = (Icons as any)[subject.icon] || BookOpen;
                  return (
                    <div key={subject.id} className="bg-card p-4 rounded-xl border border-border flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-lg", subject.color + '/10', subject.color.replace('bg-', 'text-'))}>
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div className={cn("w-2 h-12 rounded-full", subject.color)} />
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">{language === 'ar' ? 'د.' : 'Dr.'} {subject.profName}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(subject.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
