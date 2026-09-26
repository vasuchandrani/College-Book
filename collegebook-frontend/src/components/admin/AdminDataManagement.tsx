import { useState, useEffect } from "react";
import {
  Building2,
  BookOpen,
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  X,
  Search,
} from "lucide-react";
import {
  getColleges,
  getCoursesByCollege,
  getBranchesByCourse,
  adminCreateCollege,
  adminUpdateCollege,
  adminDeleteCollege,
  adminCreateCourse,
  adminUpdateCourse,
  adminDeleteCourse,
  adminCreateBranch,
  adminUpdateBranch,
  adminDeleteBranch,
  type CollegeItem,
  type CourseItem,
  type BranchItem,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminDataManagement() {
  const [activeTab, setActiveTab] = useState("colleges");

  // Data states
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);

  // Selection states
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit/Create states
  const [editingCollege, setEditingCollege] = useState<Partial<CollegeItem> | null>(null);
  const [editingCourse, setEditingCourse] = useState<Partial<CourseItem> | null>(null);
  const [editingBranch, setEditingBranch] = useState<Partial<BranchItem> | null>(null);

  // Delete states
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);

  // Search states
  const [searchCollege, setSearchCollege] = useState("");

  const loadColleges = async () => {
    setLoading(true);
    try {
      const data: any = await getColleges();
      setColleges(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load colleges");
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async (collegeId: string) => {
    if (!collegeId) {
      setCourses([]);
      return;
    }
    setLoading(true);
    try {
      const data: any = await getCoursesByCollege(collegeId);
      setCourses(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async (courseId: string) => {
    if (!courseId) {
      setBranches([]);
      return;
    }
    setLoading(true);
    try {
      const data: any = await getBranchesByCourse(courseId);
      setBranches(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  useEffect(() => {
    loadCourses(selectedCollegeId);
    setSelectedCourseId("");
    setBranches([]);
  }, [selectedCollegeId]);

  useEffect(() => {
    loadBranches(selectedCourseId);
  }, [selectedCourseId]);

  const handleSaveCollege = async () => {
    if (!editingCollege?.name || !editingCollege?.shortName || !editingCollege?.slug || !editingCollege?.city || !editingCollege?.state) {
      toast.error("Please fill in all required fields");
      return;
    }
    setActionLoading(true);
    try {
      if (editingCollege.id) {
        await adminUpdateCollege(editingCollege.id, editingCollege);
        toast.success("College updated successfully");
      } else {
        await adminCreateCollege(editingCollege);
        toast.success("College created successfully");
      }
      setEditingCollege(null);
      loadColleges();
    } catch (err: any) {
      toast.error(err.message || "Failed to save college");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!editingCourse?.name || !editingCourse?.shortName || !editingCourse?.durationYears || !editingCourse?.collegeId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setActionLoading(true);
    try {
      if (editingCourse.id) {
        await adminUpdateCourse(editingCourse.id, editingCourse);
        toast.success("Course updated successfully");
      } else {
        await adminCreateCourse(editingCourse);
        toast.success("Course created successfully");
      }
      setEditingCourse(null);
      if (selectedCollegeId) loadCourses(selectedCollegeId);
    } catch (err: any) {
      toast.error(err.message || "Failed to save course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveBranch = async () => {
    if (!editingBranch?.name || !editingBranch?.shortName || !editingBranch?.courseId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setActionLoading(true);
    try {
      if (editingBranch.id) {
        await adminUpdateBranch(editingBranch.id, editingBranch);
        toast.success("Branch updated successfully");
      } else {
        await adminCreateBranch(editingBranch);
        toast.success("Branch created successfully");
      }
      setEditingBranch(null);
      if (selectedCourseId) loadBranches(selectedCourseId);
    } catch (err: any) {
      toast.error(err.message || "Failed to save branch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      if (itemToDelete.type === "college") {
        await adminDeleteCollege(itemToDelete.id);
        toast.success("College deleted successfully");
        if (selectedCollegeId === itemToDelete.id) setSelectedCollegeId("");
        loadColleges();
      } else if (itemToDelete.type === "course") {
        await adminDeleteCourse(itemToDelete.id);
        toast.success("Course deleted successfully");
        if (selectedCourseId === itemToDelete.id) setSelectedCourseId("");
        if (selectedCollegeId) loadCourses(selectedCollegeId);
      } else if (itemToDelete.type === "branch") {
        await adminDeleteBranch(itemToDelete.id);
        toast.success("Branch deleted successfully");
        if (selectedCourseId) loadBranches(selectedCourseId);
      }
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.message || `Failed to delete ${itemToDelete.type}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredColleges = colleges.filter((c) =>
    c.name.toLowerCase().includes(searchCollege.toLowerCase()) ||
    c.shortName.toLowerCase().includes(searchCollege.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchCollege.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted p-1 rounded-xl">
          <TabsTrigger value="colleges" className="gap-2 text-xs rounded-lg"><Building2 className="h-4 w-4" /> Colleges</TabsTrigger>
          <TabsTrigger value="courses" className="gap-2 text-xs rounded-lg"><BookOpen className="h-4 w-4" /> Courses</TabsTrigger>
          <TabsTrigger value="branches" className="gap-2 text-xs rounded-lg"><GitBranch className="h-4 w-4" /> Branches</TabsTrigger>
        </TabsList>

        {/* ==================== COLLEGES TAB ==================== */}
        <TabsContent value="colleges" className="mt-4">
          <Card className="p-4 sm:p-6 shadow-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Colleges Directory
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Manage partner universities and institutions.</p>
              </div>
              <Button onClick={() => setEditingCollege({ name: "", shortName: "", slug: "", city: "", state: "", logoUrl: "", emailDomains: [] })} size="sm" className="bg-gradient-hero">
                <Plus className="h-4 w-4 mr-1.5" /> Add College
              </Button>
            </div>

            {editingCollege && (
              <Card className="p-4 bg-muted/30 border-primary/20 mb-6">
                <h4 className="font-medium text-sm mb-4">{editingCollege.id ? "Edit College" : "New College"}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Name *</label>
                    <Input value={editingCollege.name} onChange={e => setEditingCollege({ ...editingCollege, name: e.target.value })} placeholder="e.g. Dharmsinh Desai University" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Short Name *</label>
                    <Input value={editingCollege.shortName} onChange={e => setEditingCollege({ ...editingCollege, shortName: e.target.value })} placeholder="e.g. DDU" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Slug *</label>
                    <Input value={editingCollege.slug} onChange={e => setEditingCollege({ ...editingCollege, slug: e.target.value })} placeholder="e.g. ddu-nadiad" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">City *</label>
                    <Input value={editingCollege.city} onChange={e => setEditingCollege({ ...editingCollege, city: e.target.value })} placeholder="e.g. Nadiad" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">State *</label>
                    <Input value={editingCollege.state} onChange={e => setEditingCollege({ ...editingCollege, state: e.target.value })} placeholder="e.g. Gujarat" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Logo URL</label>
                    <Input value={editingCollege.logoUrl || ""} onChange={e => setEditingCollege({ ...editingCollege, logoUrl: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Email Domains (comma separated)</label>
                    <Input 
                      value={editingCollege.emailDomains?.join(", ") || ""} 
                      onChange={e => setEditingCollege({ ...editingCollege, emailDomains: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} 
                      placeholder="e.g. ddu.ac.in, student.ddu.ac.in" 
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setEditingCollege(null)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveCollege} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />} Save College
                  </Button>
                </div>
              </Card>
            )}

            <div className="relative mb-4 max-w-sm">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={searchCollege}
                onChange={e => setSearchCollege(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">College Name</th>
                      <th className="px-4 py-3 font-medium">Short</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Domains</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading && colleges.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /></td></tr>
                    ) : filteredColleges.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">No colleges found.</td></tr>
                    ) : (
                      filteredColleges.map((col) => (
                        <tr key={col.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium flex items-center gap-2">
                            {col.logoUrl ? <img src={col.logoUrl} className="h-6 w-6 rounded-md object-contain" /> : <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{col.shortName.charAt(0)}</div>}
                            {col.name}
                          </td>
                          <td className="px-4 py-3"><Badge variant="outline">{col.shortName}</Badge></td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{col.city}, {col.state}</td>
                          <td className="px-4 py-3 text-xs">
                            <div className="flex gap-1 flex-wrap">
                              {col.emailDomains?.map(d => <span key={d} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{d}</span>)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" onClick={() => setEditingCollege(col)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setItemToDelete({ type: "college", id: col.id! })}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ==================== COURSES TAB ==================== */}
        <TabsContent value="courses" className="mt-4">
          <Card className="p-4 sm:p-6 shadow-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Courses Directory
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Manage degree programs for a college.</p>
              </div>
              <Button onClick={() => setEditingCourse({ name: "", shortName: "", durationYears: 4, collegeId: selectedCollegeId })} size="sm" disabled={!selectedCollegeId} className="bg-gradient-hero">
                <Plus className="h-4 w-4 mr-1.5" /> Add Course
              </Button>
            </div>

            <div className="mb-6 flex items-center gap-3 bg-muted/40 p-3 rounded-lg border border-border">
              <span className="text-sm font-medium shrink-0">Select College:</span>
              <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
                <SelectTrigger className="w-full sm:w-[300px] h-9">
                  <SelectValue placeholder="Choose a college..." />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map(c => <SelectItem key={c.id} value={c.id!}>{c.name} ({c.shortName})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {editingCourse && (
              <Card className="p-4 bg-muted/30 border-primary/20 mb-6">
                <h4 className="font-medium text-sm mb-4">{editingCourse.id ? "Edit Course" : "New Course"}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Course Name *</label>
                    <Input value={editingCourse.name} onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })} placeholder="e.g. Bachelor of Technology" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Short Name *</label>
                    <Input value={editingCourse.shortName} onChange={e => setEditingCourse({ ...editingCourse, shortName: e.target.value })} placeholder="e.g. B.Tech" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Duration (Years) *</label>
                    <Input type="number" value={editingCourse.durationYears} onChange={e => setEditingCourse({ ...editingCourse, durationYears: parseInt(e.target.value) || 0 })} min="1" max="10" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Parent College *</label>
                    <Select value={editingCourse.collegeId} onValueChange={val => setEditingCourse({ ...editingCourse, collegeId: val })}>
                      <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
                      <SelectContent>{colleges.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setEditingCourse(null)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveCourse} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />} Save Course
                  </Button>
                </div>
              </Card>
            )}

            {!selectedCollegeId ? (
              <div className="text-center p-12 border border-dashed rounded-xl text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Please select a college to view its courses.</p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">Course Name</th>
                      <th className="px-4 py-3 font-medium">Short Name</th>
                      <th className="px-4 py-3 font-medium">Duration</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading && courses.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /></td></tr>
                    ) : courses.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">No courses configured for this college.</td></tr>
                    ) : (
                      courses.map((course) => (
                        <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{course.name}</td>
                          <td className="px-4 py-3"><Badge variant="secondary">{course.shortName}</Badge></td>
                          <td className="px-4 py-3 text-xs">{course.durationYears} Years</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-500/10" onClick={() => setEditingCourse(course)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setItemToDelete({ type: "course", id: course.id! })}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ==================== BRANCHES TAB ==================== */}
        <TabsContent value="branches" className="mt-4">
          <Card className="p-4 sm:p-6 shadow-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" /> Branches Directory
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Manage specializations and branches for courses.</p>
              </div>
              <Button onClick={() => setEditingBranch({ name: "", shortName: "", courseId: selectedCourseId })} size="sm" disabled={!selectedCourseId} className="bg-gradient-hero">
                <Plus className="h-4 w-4 mr-1.5" /> Add Branch
              </Button>
            </div>

            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">1. Select College:</label>
                <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Choose a college..." /></SelectTrigger>
                  <SelectContent>{colleges.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">2. Select Course:</label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={!selectedCollegeId || courses.length === 0}>
                  <SelectTrigger className="h-9"><SelectValue placeholder={!selectedCollegeId ? "Select college first" : "Choose a course..."} /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {editingBranch && (
              <Card className="p-4 bg-muted/30 border-primary/20 mb-6">
                <h4 className="font-medium text-sm mb-4">{editingBranch.id ? "Edit Branch" : "New Branch"}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Branch Name *</label>
                    <Input value={editingBranch.name} onChange={e => setEditingBranch({ ...editingBranch, name: e.target.value })} placeholder="e.g. Computer Engineering" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Short Name *</label>
                    <Input value={editingBranch.shortName} onChange={e => setEditingBranch({ ...editingBranch, shortName: e.target.value })} placeholder="e.g. CE" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Parent Course *</label>
                    <Select value={editingBranch.courseId} onValueChange={val => setEditingBranch({ ...editingBranch, courseId: val })}>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setEditingBranch(null)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveBranch} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />} Save Branch
                  </Button>
                </div>
              </Card>
            )}

            {!selectedCourseId ? (
              <div className="text-center p-12 border border-dashed rounded-xl text-muted-foreground">
                <GitBranch className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Please select a course to view its branches.</p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">Branch Name</th>
                      <th className="px-4 py-3 font-medium">Short Name</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading && branches.length === 0 ? (
                      <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /></td></tr>
                    ) : branches.length === 0 ? (
                      <tr><td colSpan={3} className="p-8 text-center text-muted-foreground text-xs">No branches configured for this course.</td></tr>
                    ) : (
                      branches.map((branch) => (
                        <tr key={branch.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{branch.name}</td>
                          <td className="px-4 py-3"><Badge variant="outline">{branch.shortName}</Badge></td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-500/10" onClick={() => setEditingBranch(branch)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setItemToDelete({ type: "branch", id: branch.id! })}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Global Delete Confirmation */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type} and may cascade delete associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }} className="bg-destructive hover:bg-destructive/90" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
