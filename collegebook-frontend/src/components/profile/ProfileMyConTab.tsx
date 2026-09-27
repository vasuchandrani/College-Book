import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Shield, Award } from "lucide-react";

export function ProfileMyConTab() {
  return (
    <TabsContent value="mycon">
      <div className="space-y-4">
        <Card className="p-5 shadow-card border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">Verified Student</h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verified college student badge on CollegeBook
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md shrink-0">
              ✓ Verified
            </span>
          </div>
        </Card>

        <Card className="p-8 text-center shadow-card">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="font-heading font-semibold text-base">Additional Skill Badges</h4>
            <p className="text-muted-foreground text-xs max-w-sm">
              We will introduce automated skill verification badges soon.
            </p>
          </div>
        </Card>
      </div>
    </TabsContent>
  );
}
