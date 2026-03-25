import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUniversities } from '@/hooks/useUniversities';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { useTheme, THEMES, type AppTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Check, Trash2, FileText, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LegalModal } from '@/components/LegalContent';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading, refetchProfile } = useUserProfile();
  const { universities, isLoading: uniLoading } = useUniversities(profile?.city ?? null);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [savingCity, setSavingCity] = useState(false);
  const [savingUni, setSavingUni] = useState(false);

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  const handleSignOut = async () => { await signOut(); };

  const handleCityChange = async (value: string) => {
    if (!user) return;
    setSavingCity(true);
    const needsUniReset = profile?.city !== value && profile?.university_id;
    const updateData: Record<string, unknown> = { city: value };
    if (needsUniReset) updateData.university_id = null;
    const { error } = await supabase.from('users').update(updateData).eq('id', user.id);
    if (error) toast({ variant: 'destructive', title: 'Error', description: error.message });
    else await refetchProfile();
    setSavingCity(false);
  };

  const handleUniversityChange = async (value: string) => {
    if (!user) return;
    setSavingUni(true);
    const uniId = value === 'none' ? null : value;
    const { error } = await supabase.from('users').update({ university_id: uniId }).eq('id', user.id);
    if (error) toast({ variant: 'destructive', title: 'Error', description: error.message });
    else await refetchProfile();
    setSavingUni(false);
  };

  const handleDeleteAccount = async () => {
    const confirmWord = language === 'es' ? 'ELIMINAR' : 'DELETE';
    if (deleteInput !== confirmWord) return;
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      await signOut();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to delete account' });
      setIsDeleting(false);
    }
  };


  return (
    <div className="relative px-4 pt-14 pb-28 max-w-md mx-auto">
      <div className="page-vignette" />
      <div className="relative z-20 space-y-6">
        <div className="text-center mb-2">
          <h1 className="text-[22px] font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{t('profile.yourProfile')}</h1>
          {profileLoading ? (
            <Skeleton className="h-5 w-36 mx-auto mt-2" style={{ background: 'var(--surface-skeleton)' }} />
          ) : (
            <p className="text-[15px] font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>@{profile?.username ?? 'unknown'}</p>
          )}
        </div>

        <div className="premium-panel premium-panel-gold p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('profile.city')}</label>
          <Select value={profile?.city ?? ''} onValueChange={handleCityChange} disabled={savingCity || profileLoading}>
            <SelectTrigger className="w-full h-12 text-sm rounded-xl" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
              <SelectValue placeholder={t('profile.addCity')} />
            </SelectTrigger>
            <SelectContent>{COLOMBIAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="premium-panel p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('profile.university')}</label>
          <Select value={profile?.university_id ?? 'none'} onValueChange={handleUniversityChange} disabled={savingUni || uniLoading || !profile?.city}>
            <SelectTrigger className="w-full h-12 text-sm rounded-xl" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
              <SelectValue placeholder={!profile?.city ? t('profile.setCityFirst') : t('profile.addUniversity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('profile.noneStudent')}</SelectItem>
              {universities.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {!profile?.city && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('profile.setCityFirst')}</p>}
        </div>

        <div className="premium-panel p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('profile.theme')}</label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t_item) => {
              const isActive = theme === t_item.id;
              return (
                <button key={t_item.id} onClick={() => setTheme(t_item.id)}
                  className="relative rounded-2xl p-3 text-left transition-all duration-200 active:scale-[0.97]"
                  style={{ background: t_item.preview.bg, border: isActive ? `2px solid ${t_item.preview.accent}` : '2px solid var(--surface-card-border)' }}>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: t_item.preview.accent }}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-2">
                    <div className="w-4 h-4 rounded-md" style={{ background: t_item.preview.card }} />
                    <div className="w-4 h-4 rounded-md" style={{ background: t_item.preview.accent }} />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: t_item.id === 'world-cup-2026' ? '#1A1A1A' : 'rgba(255,255,255,0.9)' }}>
                    {language === 'es' ? t_item.labelEs : t_item.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="premium-panel p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('profile.language')}</label>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--surface-input-border)' }}>
            <button onClick={() => setLanguage('en')} className="flex-1 py-3 text-sm font-medium transition-colors"
              style={language === 'en' ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-hover)))', color: '#FFFFFF' } : { background: 'var(--surface-card)', color: 'var(--text-secondary)' }}>
              English
            </button>
            <button onClick={() => setLanguage('es')} className="flex-1 py-3 text-sm font-medium transition-colors"
              style={language === 'es' ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-hover)))', color: '#FFFFFF' } : { background: 'var(--surface-card)', color: 'var(--text-secondary)' }}>
              Español
            </button>
          </div>
        </div>

        {/* Legal section */}
        <div className="premium-panel p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('profile.legal')}</label>
          <button onClick={() => setLegalModal('terms')}
            className="w-full h-12 flex items-center gap-3 px-4 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
            <FileText className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            {t('profile.termsAndConditions')}
          </button>
          <button onClick={() => setLegalModal('privacy')}
            className="w-full h-12 flex items-center gap-3 px-4 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
            <Shield className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            {t('profile.privacyPolicy')}
          </button>
        </div>

        {/* Support button */}
        <button onClick={() => setShowSupportDialog(true)}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-card-border)', color: 'var(--text-primary)' }}>
          <HelpCircle className="w-4 h-4" />
          {t('profile.support')}
        </button>
        <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>support.trade11@gmail.com</p>

        <div className="pt-2 space-y-3">
          <button onClick={handleSignOut}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'var(--surface-card)', border: '1px solid rgba(239,68,68,0.3)', color: 'hsl(0, 84%, 60%)' }}>
            <LogOut className="w-4 h-4" />
            {t('profile.logout')}
          </button>

          <button onClick={() => { setShowDeleteDialog(true); setDeleteInput(''); setShowDeleteConfirm(false); }}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', color: 'hsl(0, 70%, 55%)' }}>
            <Trash2 className="w-3.5 h-3.5" />
            {t('profile.deleteAccount')}
          </button>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-card-border)' }}>
          {!showDeleteConfirm ? (
            <>
              <DialogHeader>
                <DialogTitle style={{ color: 'var(--text-primary)' }}>{t('profile.deleteConfirmTitle')}</DialogTitle>
                <DialogDescription style={{ color: 'var(--text-muted)' }}>{t('profile.deleteConfirmMessage')}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}
                  style={{ borderColor: 'var(--surface-card-border)', color: 'var(--text-primary)' }}>
                  {t('profile.cancel')}
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                  {t('profile.deleteConfirmButton')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle style={{ color: 'var(--text-primary)' }}>{t('profile.deleteConfirmTitle')}</DialogTitle>
                <DialogDescription style={{ color: 'var(--text-muted)' }}>
                  {t('profile.deleteTypingPrompt')}
                </DialogDescription>
              </DialogHeader>
              <Input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={language === 'es' ? 'ELIMINAR' : 'DELETE'}
                className="rounded-xl"
                style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}
                  style={{ borderColor: 'var(--surface-card-border)', color: 'var(--text-primary)' }}>
                  {t('profile.cancel')}
                </Button>
                <Button variant="destructive"
                  disabled={deleteInput !== (language === 'es' ? 'ELIMINAR' : 'DELETE') || isDeleting}
                  onClick={handleDeleteAccount}>
                  {isDeleting ? t('profile.deleting') : t('profile.deleteConfirmButton')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Support Dialog */}
      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent className="rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-card-border)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>{t('profile.support')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('profile.supportSubject')}</label>
              <Input
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                className="rounded-xl"
                style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('profile.supportMessage')}</label>
              <Textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={4}
                className="rounded-xl resize-none"
                style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowSupportDialog(false)} disabled={isSendingSupport}
              style={{ borderColor: 'var(--surface-card-border)', color: 'var(--text-primary)' }}>
              {t('profile.cancel')}
            </Button>
            <Button onClick={handleSendSupport} disabled={isSendingSupport}
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-hover)))', color: '#fff' }}>
              {isSendingSupport ? t('profile.supportSending') : t('profile.supportSend')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </div>
  );
};

export default Profile;
