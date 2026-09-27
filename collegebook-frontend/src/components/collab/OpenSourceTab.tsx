import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code2,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Github,
  ExternalLink,
  Users,
  Eye,
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

interface OpenSourceTabProps {
  myOpenSourceProjects: any[];
  openCreateDialog: (type: "project" | "hackathon" | "open_source") => void;
  isUserCreatorOf: (project: any) => boolean;
  openEditTeam: (project: any) => void;
  setDeleteConfirm: (id: string) => void;
  handleToggleStar: (id: string) => void;
  tabPagination: Record<string, { hasMore: boolean }>;
  loadMoreTab: () => void;
  loadingMore: boolean;
}

export function OpenSourceTab({
  myOpenSourceProjects,
  openCreateDialog,
  isUserCreatorOf,
  openEditTeam,
  setDeleteConfirm,
  handleToggleStar,
  tabPagination,
  loadMoreTab,
  loadingMore,
}: OpenSourceTabProps) {
  return (
    <TabsContent value="open_source" className="space-y-4">
      {myOpenSourceProjects.length === 0 ? (
        <Card className="p-6 sm:p-10 text-center shadow-card space-y-3 border-dashed">
          <Code2 className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <h3 className="font-semibold text-base">No Open-Source Repositories Published</h3>
          <p className="text-muted-foreground text-xs max-w-md mx-auto">
            Share your open-source tools, packages, and code with students across campuses!
          </p>
          <Button
            size="sm"
            className="mt-2 text-xs"
            variant="outline"
            onClick={() => openCreateDialog("open_source")}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Publish Repository
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {myOpenSourceProjects.map((project, i) => (
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
                        className="text-xs bg-primary/10 text-primary border border-primary/20 shrink-0"
                      >
                        Open Source
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
                        <DropdownMenuContent align="end" className="w-40">
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
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-md border border-primary/20 max-w-full"
                      >
                        <Github className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[220px] sm:max-w-[360px]">
                          {project.githubLink.replace(/^https?:\/\//, "")}
                        </span>
                        <ExternalLink className="h-3 w-3 ml-0.5 opacity-70 shrink-0" />
                      </a>
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
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
                                  key={`${project.id}-os-role-${role}-${idx}`}
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
                              key={`${project.id}-os-tech-${tech}-${idx}`}
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

                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
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
          ))}
        </div>
      )}
      {/* Bottom Sentinel for Intersection Observer */}
      {tabPagination.open_source?.hasMore && (
        <PaginationSentinel onIntersect={loadMoreTab} loading={loadingMore} />
      )}
    </TabsContent>
  );
}
