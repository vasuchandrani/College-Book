import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Rocket,
  Plus,
  MoreVertical,
  CheckCircle2,
  Pencil,
  Trash2,
  ExternalLink,
  Users,
  Code2,
  Eye,
  UsersRound,
  MessageSquare,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationSentinel } from "@/components/common/PaginationSentinel";

interface ActiveTeamsTabProps {
  activeTeams: any[];
  incomingRequests: any[];
  isUserCreatorOf: (project: any) => boolean;
  unreadRooms: Set<string>;
  markRoomAsRead: (id: string) => void;
  setUnreadRooms: React.Dispatch<React.SetStateAction<Set<string>>>;
  openCreateDialog: (type: "project" | "hackathon") => void;
  handleOpenViewRequests: (project: any) => void;
  openEditTeam: (project: any) => void;
  setCompleteConfirm: (id: string) => void;
  setDeleteConfirm: (id: string) => void;
  handleToggleStar: (id: string) => void;
  tabPagination: Record<string, { hasMore: boolean }>;
  loadMoreTab: () => void;
  loadingMore: boolean;
}

export function ActiveTeamsTab({
  activeTeams,
  incomingRequests,
  isUserCreatorOf,
  unreadRooms,
  markRoomAsRead,
  setUnreadRooms,
  openCreateDialog,
  handleOpenViewRequests,
  openEditTeam,
  setCompleteConfirm,
  setDeleteConfirm,
  handleToggleStar,
  tabPagination,
  loadMoreTab,
  loadingMore,
}: ActiveTeamsTabProps) {
  const navigate = useNavigate();

  return (
    <TabsContent value="active_teams" className="space-y-4">
      {activeTeams.length === 0 ? (
        <Card className="p-10 text-center shadow-card space-y-3 border-dashed">
          <Rocket className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <h3 className="font-semibold text-base">No Recruiting Teams Yet</h3>
          <p className="text-muted-foreground text-xs max-w-md mx-auto">
            Assemble a hackathon crew or find contributors for your project opening on Collab Hub.
          </p>
          <Button
            size="sm"
            className="mt-2 text-xs"
            variant="outline"
            onClick={() => openCreateDialog("project")}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Start a Team on Collab Hub
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeTeams.map((project, i) => {
            const projectRequests = incomingRequests.filter(
              (r: any) => r.teamId === project.id || r.projectId === project.id
            );
            const pendingRequests = projectRequests.filter(
              (r: any) => String(r.status).toUpperCase() === "PENDING"
            );

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                        <Link
                          to={`/my-collaboration/${project.id}`}
                          className="font-semibold text-base hover:text-primary hover:underline transition-colors break-words"
                        >
                          {project.title}
                        </Link>

                        <Badge
                          variant="secondary"
                          className={`text-xs capitalize shrink-0 ${project.type === "HACKATHON" || project.type === "hackathon"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                        >
                          {project.type === "HACKATHON" || project.type === "hackathon"
                            ? "Hackathon Team"
                            : "Team Project"}
                        </Badge>

                        <Badge variant="secondary" className="text-xs shrink-0">
                          {project.currentMembersCount || (project.members || []).length || 1}/{project.maxMembers || 4} members
                        </Badge>

                        <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                          Hiring Open
                        </Badge>
                      </div>

                      {isUserCreatorOf(project) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg -mt-1 -mr-1"
                              title="Project actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => setCompleteConfirm(project.id)}
                              className="gap-2 cursor-pointer text-xs text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400 font-medium"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Complete Hiring
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditTeam(project)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirm(project.id)}
                              className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 text-ellipsis">
                        {project.description}
                      </p>
                    )}

                    {project.githubLink && (
                      <div>
                        <a
                          href={
                            project.githubLink.startsWith("http")
                              ? project.githubLink
                              : `https://${project.githubLink}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 max-w-full"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[220px] sm:max-w-[360px]">
                            {project.githubLink.replace(/^https?:\/\//, "")}
                          </span>
                        </a>
                      </div>
                    )}

                    <div className="space-y-1.5 pt-1">
                      {((project.requiredRoles && project.requiredRoles.length > 0) ||
                        (project.requiredExpertise && project.requiredExpertise.length > 0)) && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                              <Users className="h-3 w-3" /> Looking for roles:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(project.requiredRoles || project.requiredExpertise || []).map(
                                (role: string, idx: number) => (
                                  <Badge
                                    key={`${project.id}-act-role-${role}-${idx}`}
                                    variant="secondary"
                                    className="text-[11px] px-2.5 py-0.5 font-medium bg-primary/10 text-primary border border-primary/20"
                                  >
                                    {role}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {project.skills && project.skills.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            <Code2 className="h-3 w-3" /> Tech Stack:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {project.skills.map((tech: string, idx: number) => (
                              <Badge
                                key={`${project.id}-act-tech-${tech}-${idx}`}
                                variant="outline"
                                className="text-[11px] px-2.5 py-0.5 font-medium bg-muted/40"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Responsive Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
                      {/* Primary Actions */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs h-8 px-2.5"
                        >
                          <Link to={`/my-collaboration/${project.id}`}>
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </Link>
                        </Button>

                        {isUserCreatorOf(project) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className={`gap-1.5 text-xs h-8 px-2.5 ${pendingRequests.length > 0
                              ? "border-primary text-primary bg-primary/5 font-semibold"
                              : ""
                              }`}
                            onClick={() => handleOpenViewRequests(project)}
                          >
                            <UsersRound className="h-3.5 w-3.5" /> View Requests
                            {pendingRequests.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 h-4 ml-0.5 bg-primary text-primary-foreground font-semibold"
                              >
                                {pendingRequests.length}
                              </Badge>
                            )}
                          </Button>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 font-medium select-none"
                          >
                            ✓ Joined Member
                          </Badge>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            markRoomAsRead(project.id);
                            setUnreadRooms((prev) => {
                              const next = new Set(prev);
                              next.delete(project.id);
                              return next;
                            });
                            navigate(`/my-collaboration/${project.id}?tab=chat`);
                          }}
                          className={`gap-1.5 text-xs h-8 px-2.5 ${unreadRooms.has(project.id)
                            ? "bg-primary/10 text-primary border-primary font-bold shadow-2xs"
                            : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 font-semibold"
                            }`}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Room Chat</span>
                          {unreadRooms.has(project.id) && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 h-4 bg-primary text-primary-foreground font-bold shadow-2xs ml-0.5"
                            >
                              New
                            </Badge>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStar(project.id)}
                          className={`gap-1.5 text-xs h-8 px-2.5 border border-border/50 ${project.starred ? "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20" : "text-muted-foreground"
                            }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${project.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                          <span className="font-semibold text-xs">{project.starsCount || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
      {/* Bottom Sentinel for Intersection Observer */}
      {tabPagination.active_teams?.hasMore && (
        <PaginationSentinel onIntersect={loadMoreTab} loading={loadingMore} />
      )}
    </TabsContent>
  );
}
