import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Rocket, Code2, Users, ExternalLink, Github, Eye } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileStarredTabProps {
  starredProjects: any[];
  handleToggleStarProject: (id: string) => void;
}

export function ProfileStarredTab({ starredProjects, handleToggleStarProject }: ProfileStarredTabProps) {
  return (
    <TabsContent value="starred" className="space-y-4 focus-visible:outline-none">
      {starredProjects.length === 0 ? (
        <Card className="p-10 text-center shadow-card space-y-3 border-dashed">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
            <Star className="h-6 w-6" />
          </div>
          <h4 className="font-semibold text-base">No Starred Projects Yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Projects and repositories you star in Collaboration Hub will be saved here for quick access.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2 text-xs">
            <Link to="/collab">
              <Rocket className="h-3.5 w-3.5 mr-1.5" /> Explore Collab Hub
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {starredProjects.map((project, i) => {
            const isOpenSource =
              project.type === "OPEN_SOURCE" || project.type === "open_source";
            const isHackathon =
              project.type === "HACKATHON" || project.type === "hackathon";

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <Card className="p-5 shadow-card hover:shadow-elevated transition-all border-border/80 hover:border-primary/40">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2.5">
                      {/* Header badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/collab/${project.id}`}
                          className="font-bold text-base text-foreground tracking-tight hover:text-primary hover:underline transition-colors"
                        >
                          {project.title}
                        </Link>

                        {isOpenSource ? (
                          <Badge
                            variant="secondary"
                            className="text-[11px] bg-primary/10 text-primary border border-primary/20"
                          >
                            <Code2 className="h-3 w-3 mr-1" /> Open Source
                          </Badge>
                        ) : isHackathon ? (
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          >
                            <Users className="h-3 w-3 mr-1" /> Hackathon Team
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          >
                            <Rocket className="h-3 w-3 mr-1" /> Team Project
                          </Badge>
                        )}

                        {!isOpenSource && (
                          <Badge variant="outline" className="text-[11px]">
                            {project.currentMembersCount || 1}/{project.maxMembers || 4} members
                          </Badge>
                        )}

                        {project.completed && (
                          <Badge
                            variant="outline"
                            className="text-[11px] text-emerald-600 border-emerald-500/30"
                          >
                            Completed
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-foreground/85 leading-relaxed line-clamp-2 text-ellipsis">
                        {project.description || "Collaboration project on CollegeBook."}
                      </p>

                      {/* GitHub Link */}
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
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 transition-colors"
                          >
                            <Github className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[280px]">
                              {project.githubLink.replace(/^https?:\/\//, "")}
                            </span>
                            <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
                          </a>
                        </div>
                      )}

                      {/* Creator / Lead & College */}
                      <div className="flex flex-wrap items-center gap-3 pt-0.5">
                        <div className="flex items-center gap-1.5 text-xs bg-muted/60 px-2 py-1 rounded-md border border-border/40">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                              {(project.ownerName || "L").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            to={`/student/${encodeURIComponent(project.ownerName || "")}`}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {project.ownerName || "Student"}
                          </Link>
                          <span className="text-muted-foreground text-[10px]">
                            {isOpenSource ? "· Creator" : "· Lead"}
                          </span>
                        </div>

                        {project.ownerCollegeName && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{project.ownerCollegeName}</span>
                          </div>
                        )}
                      </div>

                      {/* Tech stack badges */}
                      {((project.requiredExpertise && project.requiredExpertise.length > 0) ||
                        (project.skills && project.skills.length > 0)) && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {Array.from(
                              new Set([
                                ...(project.requiredExpertise || []),
                                ...(project.skills || []),
                              ])
                            ).map((skill: string, idx: number) => (
                              <Badge
                                key={`${project.id}-skill-${skill}-${idx}`}
                                variant="outline"
                                className="text-[11px] px-2 py-0.5 font-medium bg-muted/40"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Right Actions: View Details, Star */}
                    <div className="flex sm:flex-col items-center justify-end sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-9 px-3 border border-border/70 hover:bg-muted font-medium w-full sm:w-auto"
                      >
                        <Link to={`/collab/${project.id}`}>
                          <Eye className="h-3.5 w-3.5" /> View Details
                        </Link>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStarProject(project.id)}
                        className="gap-1.5 text-xs h-9 px-3 border border-amber-400/40 text-amber-500 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 w-full sm:w-auto"
                        title="Unstar project"
                      >
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-semibold">{project.starsCount || 1}</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </TabsContent>
  );
}
