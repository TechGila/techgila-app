import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { useNotifications } from "@/contexts/useNotifications";
import { Switch } from "@/components/ui/switch";
import { useAutoRefresh } from "@/contexts/AutoRefreshContext";

export default function NotificationsButton() {
  const { notifications, markRead, clearAll } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;
  const { enabled, setEnabled } = useAutoRefresh();
  const [loadingClear, setLoadingClear] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-9 w-9'>
          <Bell className='h-5 w-5' />
          {unread > 0 && (
            <Badge className='absolute -top-1 -right-1'>{unread}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[320px]'>
        <div className='p-3'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-medium'>Notifications</div>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-muted-foreground'>
                Auto-Refresh
              </span>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </div>
        </div>
        {notifications.length === 0 ? (
          <div className='p-4 text-sm text-muted-foreground'>
            No notifications
          </div>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <DropdownMenuItem key={n.id} onClick={() => markRead(n.id)}>
              <div className='flex items-start gap-2'>
                <div className='flex-1'>
                  <div className='text-sm font-medium'>{n.title}</div>
                  {n.description && (
                    <div className='text-xs text-muted-foreground'>
                      {n.description}
                    </div>
                  )}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {new Date(n.timestamp || "").toLocaleTimeString()}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <div className='p-3 flex items-center justify-between'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() =>
              window.dispatchEvent(new CustomEvent("global:refresh"))
            }
          >
            <Loader2 className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={async () => {
              setLoadingClear(true);
              await new Promise((r) => setTimeout(r, 300));
              clearAll();
              setLoadingClear(false);
            }}
          >
            {loadingClear ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              "Clear"
            )}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
