import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UsersRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

interface ProfilePeersTabProps {
  profile: any;
  campusStudents: any[];
}

export function ProfilePeersTab({ profile, campusStudents }: ProfilePeersTabProps) {
  return (
    <TabsContent value="peers">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">Students from {profile.college}</p>
        {campusStudents.length === 0 ? (
          <Card className="p-8 text-center shadow-card">
            <p className="text-muted-foreground text-sm">
              No other students registered from your college yet.
            </p>
          </Card>
        ) : (
          campusStudents.map((peer, i) => (
            <motion.div
              key={peer.slug || peer.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/student/${encodeURIComponent(peer.slug || peer.name)}`}>
                <Card className="p-4 shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {peer.avatarUrl ? (
                          <AvatarImage src={peer.avatarUrl} alt={peer.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {peer.initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{peer.name || peer.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {peer.courseName
                            ? `${peer.courseName}${peer.currentYear ? ` • ${peer.currentYear}${peer.currentYear === 1 ? "st" : peer.currentYear === 2 ? "nd" : peer.currentYear === 3 ? "rd" : "th"} Year` : ""}`
                            : peer.defaultBio || "Student"}
                        </p>
                      </div>
                    </div>
                    <UsersRound className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </TabsContent>
  );
}
