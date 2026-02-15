import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { MoreVertical, ShieldBan, ShieldCheck } from 'lucide-react';

interface BlockUserMenuProps {
  userId: string;
  username: string | null;
}

export function BlockUserMenu({ userId, username }: BlockUserMenuProps) {
  const navigate = useNavigate();
  const { isBlocked, block, unblock, isBlocking, isUnblocking } = useBlockedUsers();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const blocked = isBlocked(userId);

  const handleBlock = async () => {
    try {
      await block(userId);
      toast({ title: 'User blocked' });
      setConfirmOpen(false);
      navigate(-1);
    } catch {
      toast({ title: 'Error', description: 'Failed to block user', variant: 'destructive' });
    }
  };

  const handleUnblock = async () => {
    try {
      await unblock(userId);
      toast({ title: 'User unblocked' });
    } catch {
      toast({ title: 'Error', description: 'Failed to unblock user', variant: 'destructive' });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {blocked ? (
            <DropdownMenuItem onClick={handleUnblock} disabled={isUnblocking}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Unblock user
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setConfirmOpen(true)}>
              <ShieldBan className="h-4 w-4 mr-2" />
              Block user
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block @{username ?? 'this user'}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won't appear in your matches, chats, or requests. You can unblock them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} disabled={isBlocking}>
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
