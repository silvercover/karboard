import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const languages: Record<string, Language> = {
  en: { code: 'en', name: 'English', direction: 'ltr' },
  fa: { code: 'fa', name: 'فارسی', direction: 'rtl' }
};

const translations: Record<string, Record<string, string>> = {
  en: {
    'app.title': 'Trello Clone',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.name': 'Name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login.button': 'Sign In',
    'auth.register.button': 'Sign Up',
    'auth.switch.register': 'Need an account? Sign up',
    'auth.switch.login': 'Already have an account? Sign in',
    'auth.error.invalid': 'Invalid email or password',
    'auth.error.exists': 'User already exists',
    'project.create': 'Create Project',
    'project.title': 'Project Title',
    'project.description': 'Project Description',
    'project.visibility': 'Project Visibility',
    'project.public': 'Public Project',
    'project.private': 'Private Project',
    'project.public.desc': 'Anyone can view this project',
    'project.private.desc': 'Only invited members can access',
    'project.invite': 'Invite User',
    'project.invite.name': 'User Name',
    'project.invite.email': 'User Email',
    'project.settings': 'Project Settings',
    'project.members': 'Members',
    'project.permissions': 'Permissions',
    'project.permissions.view': 'Can View',
    'project.permissions.create': 'Can Create Tasks',
    'project.permissions.delete': 'Can Delete Tasks',
    'board.title': 'My Board',
    'list.add': 'Add List',
    'list.edit': 'Edit List',
    'list.delete': 'Delete List',
    'list.options': 'List Options',
    'list.title.placeholder': 'Enter list title',
    'card.add': 'Add Card',
    'card.title.placeholder': 'Enter card title',
    'card.description.placeholder': 'Enter card description',
    'card.due.date': 'Due Date',
    'card.due.remove': 'Remove due date',
    'card.labels': 'Labels',
    'card.checklist': 'Checklist',
    'card.attachments': 'Attachments',
    'card.comments': 'Comments',
    'card.save': 'Save Card',
    'card.cancel': 'Cancel',
    'card.edit': 'Edit',
    'card.delete': 'Delete',
    'card.delete.confirm.title': 'Delete Card',
    'card.delete.confirm.message': 'Are you sure you want to delete this card? This action cannot be undone.',
    'card.delete.confirm.yes': 'Delete',
    'card.delete.confirm.no': 'Cancel',
    'checklist.add.item': 'Add item',
    'checklist.item.placeholder': 'Enter checklist item',
    'checklist.completed': 'completed',
    'attachment.upload': 'Upload File',
    'attachment.uploading': 'Uploading...',
    'attachment.download': 'Download',
    'attachment.remove': 'Remove',
    'comment.add': 'Add Comment',
    'comment.placeholder': 'Write a comment...',
    'comment.post': 'Post',
    'comment.edit': 'Edit',
    'comment.delete': 'Delete',
    'comment.delete.confirm.title': 'Delete Comment',
    'comment.delete.confirm.message': 'Are you sure you want to delete this comment?',
    'comment.delete.confirm.yes': 'Delete',
    'comment.delete.confirm.no': 'Cancel',
    'comment.save': 'Save',
    'comment.cancel': 'Cancel',
    'comment.reply': 'Reply',
    'comment.reply.placeholder': 'Write a reply...',
    'search.placeholder': 'Search cards...',
    'language.switch': 'فارسی',
    'today': 'Today',
    'tomorrow': 'Tomorrow',
    'overdue': 'Overdue',
    'profile': 'Profile',
    'profile.avatar': 'Profile Picture',
    'save': 'Save',
    'cancel': 'Cancel',
    'create': 'Create',
    'invite': 'Invite',
    'accept': 'Accept',
    'reject': 'Reject',
    'user': 'User',
    'role.admin': 'Admin',
    'role.member': 'Member',
    'member.remove': 'Remove Member',
    'member.remove.confirm.title': 'Remove Member',
    'member.remove.confirm.message': 'Are you sure you want to remove this member from the project?',
    'member.remove.confirm.yes': 'Remove',
    'member.remove.confirm.no': 'Cancel',
    'email.settings': 'Email Settings',
    'email.provider': 'Email Provider',
    'email.from.email': 'From Email',
    'email.from.name': 'From Name',
    'email.smtp.settings': 'SMTP Settings',
    'email.smtp.host': 'SMTP Host',
    'email.smtp.port': 'Port',
    'email.smtp.username': 'Username',
    'email.smtp.password': 'Password',
    'email.api.key': 'API Key',
    'email.test.title': 'Test Email Configuration',
    'email.test.description': 'Save settings and test by sending an invitation to verify email delivery.',
    'markdown.edit': 'Edit',
    'markdown.preview': 'Preview'
  },
  fa: {
    'app.title': 'کلون ترلو',
    'auth.login': 'ورود',
    'auth.register': 'ثبت نام',
    'auth.logout': 'خروج',
    'auth.name': 'نام',
    'auth.email': 'ایمیل',
    'auth.password': 'رمز عبور',
    'auth.login.button': 'ورود',
    'auth.register.button': 'ثبت نام',
    'auth.switch.register': 'حساب کاربری ندارید؟ ثبت نام کنید',
    'auth.switch.login': 'حساب کاربری دارید؟ وارد شوید',
    'auth.error.invalid': 'ایمیل یا رمز عبور نامعتبر',
    'auth.error.exists': 'کاربر از قبل وجود دارد',
    'project.create': 'ایجاد پروژه',
    'project.title': 'عنوان پروژه',
    'project.description': 'توضیحات پروژه',
    'project.visibility': 'نوع دسترسی پروژه',
    'project.public': 'پروژه عمومی',
    'project.private': 'پروژه خصوصی',
    'project.public.desc': 'همه می‌توانند این پروژه را مشاهده کنند',
    'project.private.desc': 'فقط اعضای دعوت شده دسترسی دارند',
    'project.invite': 'دعوت کاربر',
    'project.invite.name': 'نام کاربر',
    'project.invite.email': 'ایمیل کاربر',
    'project.settings': 'تنظیمات پروژه',
    'project.members': 'اعضا',
    'project.permissions': 'سطح دسترسی',
    'project.permissions.view': 'مشاهده',
    'project.permissions.create': 'ایجاد تسک',
    'project.permissions.delete': 'حذف تسک',
    'board.title': 'تخته من',
    'list.add': 'افزودن لیست',
    'list.edit': 'ویرایش لیست',
    'list.delete': 'حذف لیست',
    'list.options': 'گزینه‌های لیست',
    'list.title.placeholder': 'عنوان لیست را وارد کنید',
    'card.add': 'افزودن کارت',
    'card.title.placeholder': 'عنوان کارت را وارد کنید',
    'card.description.placeholder': 'توضیحات کارت را وارد کنید',
    'card.due.date': 'تاریخ سررسید',
    'card.due.remove': 'حذف تاریخ سررسید',
    'card.labels': 'برچسب‌ها',
    'card.checklist': 'چک‌لیست',
    'card.attachments': 'پیوست‌ها',
    'card.comments': 'نظرات',
    'card.save': 'ذخیره کارت',
    'card.cancel': 'لغو',
    'card.edit': 'ویرایش',
    'card.delete': 'حذف',
    'card.delete.confirm.title': 'حذف کارت',
    'card.delete.confirm.message': 'آیا مطمئن هستید که می‌خواهید این کارت را حذف کنید؟ این عمل قابل بازگشت نیست.',
    'card.delete.confirm.yes': 'حذف',
    'card.delete.confirm.no': 'لغو',
    'checklist.add.item': 'افزودن آیتم',
    'checklist.item.placeholder': 'متن آیتم را وارد کنید',
    'checklist.completed': 'تکمیل شده',
    'attachment.upload': 'آپلود فایل',
    'attachment.uploading': 'در حال آپلود...',
    'attachment.download': 'دانلود',
    'attachment.remove': 'حذف',
    'comment.add': 'افزودن نظر',
    'comment.placeholder': 'نظر خود را بنویسید...',
    'comment.post': 'ارسال',
    'comment.edit': 'ویرایش',
    'comment.delete': 'حذف',
    'comment.delete.confirm.title': 'حذف نظر',
    'comment.delete.confirm.message': 'آیا مطمئن هستید که می‌خواهید این نظر را حذف کنید؟',
    'comment.delete.confirm.yes': 'حذف',
    'comment.delete.confirm.no': 'لغو',
    'comment.save': 'ذخیره',
    'comment.cancel': 'لغو',
    'comment.reply': 'پاسخ',
    'comment.reply.placeholder': 'پاسخ خود را بنویسید...',
    'search.placeholder': 'جستجوی کارت‌ها...',
    'language.switch': 'English',
    'today': 'امروز',
    'tomorrow': 'فردا',
    'overdue': 'گذشته',
    'profile': 'پروفایل',
    'profile.avatar': 'عکس پروفایل',
    'save': 'ذخیره',
    'cancel': 'لغو',
    'create': 'ایجاد',
    'invite': 'دعوت',
    'accept': 'پذیرش',
    'reject': 'رد',
    'user': 'کاربر',
    'role.admin': 'ادمین',
    'role.member': 'عضو',
    'member.remove': 'حذف عضو',
    'member.remove.confirm.title': 'حذف عضو',
    'member.remove.confirm.message': 'آیا مطمئن هستید که می‌خواهید این عضو را از پروژه حذف کنید؟',
    'member.remove.confirm.yes': 'حذف',
    'member.remove.confirm.no': 'لغو',
    'email.settings': 'تنظیمات ایمیل',
    'email.provider': 'ارائه‌دهنده ایمیل',
    'email.from.email': 'ایمیل فرستنده',
    'email.from.name': 'نام فرستنده',
    'email.smtp.settings': 'تنظیمات SMTP',
    'email.smtp.host': 'هاست SMTP',
    'email.smtp.port': 'پورت',
    'email.smtp.username': 'نام کاربری',
    'email.smtp.password': 'رمز عبور',
    'email.api.key': 'کلید API',
    'email.test.title': 'تست تنظیمات ایمیل',
    'email.test.description': 'تنظیمات را ذخیره کنید و با ارسال دعوتنامه، تحویل ایمیل را تست کنید.',
    'markdown.edit': 'ویرایش',
    'markdown.preview': 'پیش‌نمایش'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(languages.en);

  useEffect(() => {
    const saved = localStorage.getItem('trello-language');
    if (saved && languages[saved]) {
      setLanguage(languages[saved]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trello-language', language.code);
    document.documentElement.dir = language.direction;
    document.documentElement.lang = language.code;
  }, [language]);

  const t = (key: string): string => {
    return translations[language.code][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { languages };