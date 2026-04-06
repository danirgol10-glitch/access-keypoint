import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatTimeAgoEs(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}
