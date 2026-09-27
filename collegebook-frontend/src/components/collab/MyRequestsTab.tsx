import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Rocket, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { PaginationSentinel } from "@/components/common/PaginationSentinel";
import { FormattedContent } from "@/components/FormattedContent";

interface MyRequestsTabProps {
  myRequests: any[];
  openEditReq: (req: any) => void;
  setDeleteReqConfirm: (id: string) => void;
  tabPagination: Record<string, { hasMore: boolean }>;
  loadMoreTab: () => void;
  loadingMore: boolean;
}

export function MyRequestsTab({
  myRequests,
  openEditReq,
  setDeleteReqConfirm,
  tabPagination,
  loadMoreTab,
  loadingMore,
}: MyRequestsTabProps) {
  return (
    <TabsContent value="my_requests" className="space-y-4">
      {myRequests.length === 0 ? (
        <Card className="p-10 text-center shadow-card space-y-2 border-dashed">
          <Users className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <h3 className="font-semibold text-base">No Requests Sent</h3>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto">
            You haven't applied to join any teams yet. Explore Collab Hub openings!
          </p>
          <Button asChild size="sm" variant="outline" className="mt-2 text-xs">
            <Link to="/collab">
              <Rocket className="h-3.5 w-3.5 mr-1" /> Explore Openings
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {myRequests.map((req, i) => {
            const statusStr = String(req.status || "pending").toUpperCase();
            const isPending = statusStr === "PENDING";
            const isAccepted = statusStr === "ACCEPTED";
            const isRejected = statusStr === "REJECTED";

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base break-words">
                          {req.projectTitle || req.teamTitle || "Collaboration Team"}
                        </h3>
                        <Badge
                          variant={
                            isAccepted
                              ? "default"
                              : isRejected
                                ? "destructive"
                                : "secondary"
                          }
                          className={`text-xs capitalize shrink-0 ${isAccepted
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : isPending
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : ""
                            }`}
                        >
                          {isAccepted ? "Accepted" : isRejected ? "Rejected" : "Pending Review"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied as:{" "}
                        <span className="font-medium text-foreground">{req.role}</span>
                      </p>
                      {(req.message || req.reason) && (
                        <div className="mt-2 text-xs space-y-1">
                          <p className="text-[11px] font-semibold text-muted-foreground">
                            Your pitch / note:
                          </p>
                          <FormattedContent
                            content={req.message || req.reason}
                            maxEnters={2}
                            className="text-xs text-foreground/90 p-3 rounded-lg bg-muted/40 border border-border/50 break-words"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-8 px-2.5"
                            onClick={() => openEditReq(req)}
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit Request
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-xs h-8 px-2.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteReqConfirm(req.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Withdraw
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
      {/* Bottom Sentinel for my_requests pagination */}
      {tabPagination.my_requests?.hasMore && (
        <PaginationSentinel onIntersect={loadMoreTab} loading={loadingMore} />
      )}
    </TabsContent>
  );
}
