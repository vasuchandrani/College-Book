import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bell, Loader2, BellRing, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getNotifications, markNotificationRead } from "@/lib/api";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { formatSmartDate } from "@/lib/dateUtils";
import { PaginationSentinel } from "@/components/common/PaginationSentinel";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const push = usePushNotifications();
  const [isLoadingPush, setIsLoadingPush] = useState(false);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    getNotifications(0, 20)
      .then((res) => {
        setNotifications(res?.items || res?.content || []);
        setHasMore(Boolean(res?.hasNext));
        setPage(res?.page !== undefined ? res.page : 0);
      })
      .catch(() => {
        setNotifications([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const loadMoreNotifications = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getNotifications(nextPage, 20);
      setNotifications((prev) => [...prev, ...(res?.items || res?.content || [])]);
      setHasMore(Boolean(res?.hasNext));
      setPage(res?.page !== undefined ? res.page : nextPage);
    } catch (error) {
      console.error("Failed to load more notifications", error);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  const handleSubscribe = async () => {
    setIsLoadingPush(true);
    await push.subscribe();
    setIsLoadingPush(false);
  };

  // Notification click handling
  const handleRead = (id: string) => {
    markNotificationRead(id).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      // Let the CB event dispatcher know it was read so the bell counter updates globally
      window.dispatchEvent(new CustomEvent("cb_notification_read"));
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-6 py-4 md:py-8 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between px-1 md:px-0">
        <div className="flex items-center gap-1.5 md:gap-3">
          <Button variant="ghost" size="icon" asChild className="-ml-2 shrink-0 md:hidden">
            <Link to="/feed">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 shrink-0">
            <Bell className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
            Notifications
          </h1>
        </div>
        
        <div className="flex items-center">
          {push.isSupported && !push.isSubscribed && (
            <Button onClick={handleSubscribe} disabled={isLoadingPush} size="sm" className="h-8 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0">
              {isLoadingPush ? (
                <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 animate-spin md:mr-1.5 shrink-0" />
              ) : (
                <BellRing className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 shrink-0" />
              )}
              Enable Push
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/60 shadow-xs bg-card/50 overflow-hidden min-h-[50vh]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading your notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h2 className="text-lg font-semibold mb-1">No notifications there</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              When you receive notifications about your projects, mentions, or activities, they will show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 pb-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleRead(n.id)}
                className={`p-4 md:p-5 flex gap-4 transition-colors hover:bg-muted/30 cursor-pointer ${
                  !n.isRead ? "bg-primary/5" : ""
                }`}
              >
                <div className="mt-1 flex-shrink-0">
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${!n.isRead ? "bg-primary" : "bg-transparent"}`} />
                </div>
                
                <div className="flex-1 space-y-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatSmartDate(n.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            
            {notifications.length > 0 && hasMore && (
              <PaginationSentinel 
                onIntersect={loadMoreNotifications} 
                loading={loadingMore} 
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
