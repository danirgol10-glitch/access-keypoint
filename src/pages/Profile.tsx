import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUniversities } from '@/hooks/useUniversities';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, FileText, GraduationCap, LogOut, MapPin, Shield, Trash2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppCard } from '@/components/ui/app-card';
import { AvatarCircle } from '@/components/ui/avatar-circle';
import { ListRow } from '@/components/ui/list-row';
import { PageHeader } from '@/components/ui/page-header';
import { LegalModal } from '@/components/LegalContent';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading, refetchProfile } = useUserProfile();
  const { universities, isLoading: uniLoading } = useUniversities(profile?.city ?? null);
  const { t } = useLanguage();
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
    if (deleteInput !== 'ELIMINAR') return;
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      await signOut();
    } catch (err: any) {
      toast({ variant: 'destructive', title: t('common.error'), description: err.message || 'Error al eliminar la cuenta' });
      setIsDeleting(false);
    }
  };

  const username = profile?.username ?? 'desconocido';
  const profileInitials = profile?.username?.slice(0, 2).toUpperCase();

  return (
    <div className="relative mx-auto max-w-lg space-y-4 px-4 safe-page">
      <div className="page-vignette" />
      <PageHeader title={t('profile.title')} className="relative z-20 px-0 pb-0 pt-0" />

      <AppCard variant="hero" className="relative z-20 p-5">
        <div className="flex items-center gap-4">
          <AvatarCircle initials={profileInitials} icon={<User />} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">{t('profile.yourProfile')}</p>
            {profileLoading ? (
              <Skeleton className="mt-2 h-5 w-36" />
            ) : (
              <p className="mt-1 truncate text-lg font-bold text-[var(--text-primary)]">@{username}</p>
            )}
          </div>
        </div>
      </AppCard>

      <AppCard className="relative z-20 space-y-4 p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
            <MapPin className="h-4 w-4" />
            {t('profile.city')}
          </div>
          <Select value={profile?.city ?? ''} onValueChange={handleCityChange} disabled={savingCity || profileLoading}>
            <SelectTrigger className="min-h-12 w-full text-base">
              <SelectValue placeholder={t('profile.addCity')} />
            </SelectTrigger>
            <SelectContent>{COLOMBIAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
            <GraduationCap className="h-4 w-4" />
            {t('profile.university')}
          </div>
          <Select value={profile?.university_id ?? 'none'} onValueChange={handleUniversityChange} disabled={savingUni || uniLoading || !profile?.city}>
            <SelectTrigger className="min-h-12 w-full text-base">
              <SelectValue placeholder={!profile?.city ? t('profile.setCityFirst') : t('profile.addUniversity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('profile.noneStudent')}</SelectItem>
              {universities.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {!profile?.city && <p className="text-xs leading-5 text-[var(--text-muted)]">{t('profile.setCityFirst')}</p>}
        </div>
      </AppCard>

      <AppCard className="relative z-20 space-y-3 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">{t('profile.legal')}</div>
        <ListRow
          interactive
          leading={<FileText className="h-4 w-4 text-[var(--text-secondary)]" />}
          title={t('profile.termsAndConditions')}
          trailing={<ChevronRight className="h-4 w-4" />}
          onClick={() => setLegalModal('terms')}
        />
        <ListRow
          interactive
          leading={<Shield className="h-4 w-4 text-[var(--text-secondary)]" />}
          title={t('profile.privacyPolicy')}
          trailing={<ChevronRight className="h-4 w-4" />}
          onClick={() => setLegalModal('privacy')}
        />
      </AppCard>


      <AppCard className="relative z-20 space-y-3 p-4">
        <Button type="button" variant="outline" className="w-full border-destructive/30 text-destructive hover:border-destructive/40 hover:text-destructive" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          {t('profile.logout')}
        </Button>

        <Button type="button" variant="destructive" className="w-full" onClick={() => { setShowDeleteDialog(true); setDeleteInput(''); setShowDeleteConfirm(false); }}>
          <Trash2 className="w-4 h-4" />
          {t('profile.deleteAccount')}
        </Button>
      </AppCard>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-[var(--radius-xl)]">
          {!showDeleteConfirm ? (
            <>
              <DialogHeader>
                <DialogTitle>{t('profile.deleteConfirmTitle')}</DialogTitle>
                <DialogDescription>{t('profile.deleteConfirmMessage')}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" className="min-h-11" onClick={() => setShowDeleteDialog(false)}>
                  {t('profile.cancel')}
                </Button>
                <Button variant="destructive" className="min-h-11" onClick={() => setShowDeleteConfirm(true)}>
                  {t('profile.deleteConfirmButton')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t('profile.deleteConfirmTitle')}</DialogTitle>
                <DialogDescription>
                  {t('profile.deleteTypingPrompt')}
                </DialogDescription>
              </DialogHeader>
              <Input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="ELIMINAR"
                className="rounded-xl"
              />
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" className="min-h-11" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                  {t('profile.cancel')}
                </Button>
                <Button variant="destructive"
                  className="min-h-11"
                  disabled={deleteInput !== 'ELIMINAR' || isDeleting}
                  onClick={handleDeleteAccount}>
                  {isDeleting ? t('profile.deleting') : t('profile.deleteConfirmButton')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>


      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </div>
  );
};

export default Profile;
