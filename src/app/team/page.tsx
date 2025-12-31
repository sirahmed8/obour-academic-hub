'use client';

import { useLanguage } from '@/contexts';
import { AppShell } from '@/components/layout/AppShell';
import { Github, Linkedin, Twitter, Code2, Coffee, Heart, Users } from 'lucide-react';
import Image from 'next/image';

const TEAM_MEMBERS = [
  {
    name: 'Ahmed Alaa',
    nameAr: 'أحمد علاء',
    role: 'Lead Developer & Architect',
    roleAr: 'المطور الرئيسي والمهندس المعماري',
    bio: 'Full-stack developer passionate about building scalable educational platforms and AI integration.',
    bioAr: 'مطور متكامل شغوف ببناء منصات تعليمية قابلة للتطوير ودمج الذكاء الاصطناعي.',
    image: 'https://ui-avatars.com/api/?name=Ahmed+Alaa&background=6366f1&color=fff&size=200',
    social: {
      github: '#',
      linkedin: '#',
      twitter: '#'
    }
  },
];

export default function TeamPage() {
  const { language } = useLanguage();

  return (
    <AppShell>
      <div className="p-6 lg:p-10 space-y-12 max-w-7xl mx-auto page-transition">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl text-primary mb-4">
            <Code2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-foreground">
            {language === 'ar' ? 'تعرف على الفريق' : 'Meet the Team'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {language === 'ar' 
              ? 'العقول وراء منصة معاهد العبور. بُنيت بـ'
              : 'The minds behind Obour Academic Hub. Built with'} 
            <Heart className="inline w-5 h-5 text-red-500 animate-pulse mx-1" /> 
            {language === 'ar' ? 'والكثير من' : 'and lots of'} 
            <Coffee className="inline w-5 h-5 text-amber-700 mx-1" />
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member, idx) => (
            <div 
              key={idx} 
              className="bg-card rounded-3xl p-8 text-center shadow-lg border border-border card-hover animate-fade-in-up"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-full p-1 bg-gradient-to-tr from-primary to-purple-500">
                <Image 
                  src={member.image} 
                  alt={member.name}
                  width={128}
                  height={128}
                  className="w-full h-full rounded-full object-cover border-4 border-card"
                />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {language === 'ar' ? member.nameAr : member.name}
              </h3>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                {language === 'ar' ? member.roleAr : member.role}
              </span>
              
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {language === 'ar' ? member.bioAr : member.bio}
              </p>

              <div className="flex justify-center gap-4">
                <a href={member.social.github} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href={member.social.linkedin} className="p-2 text-muted-foreground hover:text-blue-600 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href={member.social.twitter} className="p-2 text-muted-foreground hover:text-sky-500 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer Note */}
        <div className="text-center pt-10 border-t border-border">
          <p className="text-muted-foreground">© 2024 Obour Academic Hub. All rights reserved.</p>
        </div>
      </div>
    </AppShell>
  );
}
