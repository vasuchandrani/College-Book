import { SignupPayload, AuthUser } from './auth';
import { delay } from './client';
import type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData } from '@/types';
import type { Post, PageResponse } from './client';
import { request, clearAuthSession } from './client';

// Colleges & signup verification
// ---------------------------------------------------------------------------

export const checkHandleAvailability = async (
  handle: string
): Promise<{ handle: string; available: boolean; message: string }> => {
  const clean = handle.trim().replace(/^@/, "");
  return await request<{ handle: string; available: boolean; message: string }>(
    `/auth/check-handle?handle=${encodeURIComponent(clean)}`
  );
};

export const signup = async (payload: SignupPayload): Promise<AuthUser> => {
  const res = await request<{
    accessToken: string;
    refreshToken: string;
    user: {
      id?: string;
      email: string;
      profile?: {
        fullName?: string;
        handle?: string;
        collegeName?: string;
        courseName?: string;
        currentYear?: number;
        defaultBio?: string;
      };
    };
  }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      fullName: payload.name,
      handle: payload.handle ? payload.handle.trim().toLowerCase().replace(/^@/, "") : undefined,
      collegeId: payload.collegeId,
      courseId: payload.courseId,
      branchId: payload.branchId,
      currentYear: payload.currentYear,
      gender: payload.gender || "PREFER_NOT_TO_SAY",
    }),
  });

  if (res.accessToken) {
    localStorage.setItem("cb_token", res.accessToken);
    localStorage.setItem("cb_refresh_token", res.refreshToken);
  }

  const fullName = res.user?.profile?.fullName || payload.name;
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const collegeName = res.user?.profile?.collegeName || payload.college || "DDU";
  const collegeShort = collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((p) => p[0]).join("");

  return {
    id: res.user?.id,
    name: fullName,
    handle: res.user?.profile?.handle || payload.handle,
    initials: initials || "U",
    email: res.user.email,
    college: collegeName,
    collegeShort: collegeShort,
    course: res.user.profile?.courseName || payload.course || "Student",
    currentYear: res.user.profile?.currentYear || payload.currentYear,
    defaultBio: res.user.profile?.defaultBio,
  };
};

export const getColleges = async () => {
  const data = await request<
    { id: string; name: string; shortName: string; emailDomains: string[] }[]
  >("/colleges");

  return data.map((c, idx) => ({
    id: idx + 1,
    uuid: c.id,
    name: c.name,
    short: c.shortName,
    emailDomain: c.emailDomains?.[0] || "",
  }));
};

export interface Course {
  id: string;
  name: string;
  shortName: string;
  durationYears: number;
}

export interface Branch {
  id: string;
  courseId: string;
  name: string;
  shortName?: string;
}

export const getCoursesByCollege = async (collegeUuid: string): Promise<Course[]> => {
  return await request<Course[]>(`/colleges/${collegeUuid}/courses`);
};

export const getBranchesByCourse = async (courseId: string): Promise<Branch[]> => {
  return await request<Branch[]>(`/colleges/courses/${courseId}/branches`);
};

export interface CollegeRequestPayload {
  collegeName: string;
  city?: string;
  state?: string;
  requesterEmail: string;
  requesterName?: string;
  notes?: string;
}

export const submitCollegeRequest = async (payload: CollegeRequestPayload) => {
  return await request<CollegeRequestPayload>("/colleges/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export interface SendOtpResponse {
  sent: boolean;
  userExists?: boolean;
  message?: string;
}

export const sendOtp = async (
  email: string,
  purpose = "SIGNUP"
): Promise<SendOtpResponse> => {
  const res = await request<SendOtpResponse>("/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  });
  return res;
};

export const verifyOtp = async (
  email: string,
  code: string,
  purpose = "SIGNUP"
): Promise<{ verified: boolean }> => {
  const res = await request<{ verified: boolean }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, code, purpose }),
  });

  if (!res.verified) {
    throw new Error("Invalid or expired OTP code");
  }
  return { verified: true };
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  return await request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: token.trim(), newPassword: password }),
  });
};

export const lookupStudent = async (handleOrName: string) => {
  const clean = handleOrName.trim().replace(/^@/, "");
  return await request<{
    exists: boolean;
    student?: {
      userId: string;
      fullName: string;
      handle: string;
      collegeName: string;
      courseName: string;
      avatarUrl?: string;
    };
    message?: string;
  }>(`/students/verify-member?query=${encodeURIComponent(clean)}`);
};

export const getStudentProfile = async (slug: string) => {
  const clean = slug.trim().replace(/^@/, "");
  return await request<{
    userId: string;
    fullName: string;
    handle: string;
    collegeName: string;
    courseName: string;
    avatarUrl?: string;
  }>(`/students/${encodeURIComponent(clean)}`);
};
export const getBadgeSubmissions = () => delay<unknown[]>([]);

// ---------------------------------------------------------------------------
// Profile & Campus
// ---------------------------------------------------------------------------

export const normalizeCourseShort = (
  courseName?: string,
  courseShortName?: string,
  branchName?: string
): string => {
  const parseDept = (text?: string): string => {
    if (!text) return "";
    const t = text.trim();
    const lower = t.toLowerCase();
    if (lower.includes("information technology") || lower === "it") return "IT";
    if (lower.includes("computer science & engineering") || lower.includes("computer science and engineering") || lower === "cse" || lower.includes("computer science")) return "CSE";
    if (lower.includes("computer engineering") || lower === "ce") return "CE";
    if (lower.includes("artificial intelligence") || lower.includes("ai-ml") || lower.includes("ai/ml") || lower === "ai") return "AI-ML";
    if (lower.includes("data science") || lower === "ds") return "Data Science";
    if (lower.includes("electronics & communication") || lower.includes("electronics and communication") || lower === "ec" || lower === "ece") return "EC";
    if (lower.includes("electrical") || lower === "ee") return "EE";
    if (lower.includes("mechanical") || lower === "me") return "ME";
    if (lower.includes("civil")) return "Civil";
    if (lower.includes("chemical")) return "Chemical";
    if (lower.includes("instrumentation & control") || lower.includes("instrumentation and control") || lower === "ic") return "IC";
    if (lower.includes("biomedical") || lower === "bm") return "Biomedical";
    if (lower.includes("aerospace")) return "Aerospace";
    if (lower.includes("metallurg")) return "Metallurgy";
    if (lower.includes("textile")) return "Textile";
    if (lower.includes("pharmacy")) return "Pharmacy";
    if (lower.includes("dental")) return "Dental";
    return t;
  };

  const parseDegree = (text?: string): string => {
    if (!text) return "";
    const t = text.trim();
    const lower = t.toLowerCase();
    if (lower.includes("bachelor of technology") || lower.startsWith("b.tech") || lower.startsWith("btech")) return "B.Tech";
    if (lower.includes("master of technology") || lower.startsWith("m.tech") || lower.startsWith("mtech")) return "M.Tech";
    if (lower.includes("bachelor of engineering") || lower.startsWith("b.e") || lower.startsWith("be")) return "B.E.";
    if (lower.includes("master of engineering") || lower.startsWith("m.e") || lower.startsWith("me")) return "M.E.";
    if (lower.includes("bachelor of computer application") || lower.startsWith("bca")) return "BCA";
    if (lower.includes("master of computer application") || lower.startsWith("mca")) return "MCA";
    if (lower.includes("bachelor of business administration") || lower.startsWith("bba")) return "BBA";
    if (lower.includes("master of business administration") || lower.startsWith("mba")) return "MBA";
    if (lower.includes("bachelor of science") || lower.startsWith("b.sc") || lower.startsWith("bsc")) return "B.Sc";
    if (lower.includes("master of science") || lower.startsWith("m.sc") || lower.startsWith("msc")) return "M.Sc";
    if (lower.includes("bachelor of pharmacy") || lower.startsWith("b.pharm") || lower.startsWith("bpharm")) return "B.Pharm";
    if (lower.includes("master of pharmacy") || lower.startsWith("m.pharm") || lower.startsWith("mpharm")) return "M.Pharm";
    if (lower.includes("bachelor of dental surgery") || lower.startsWith("bds")) return "BDS";
    if (lower.includes("doctor of philosophy") || lower.startsWith("phd")) return "PhD";
    return t;
  };

  const rawCombined = `${courseShortName || ""} ${courseName || ""} ${branchName || ""}`.trim();
  if (!rawCombined) return "Student";

  const degree = parseDegree(courseShortName || courseName);
  let dept = parseDept(branchName);

  // If branch wasn't passed directly, check if courseName contains branch info (e.g. "B.Tech IT", "B.Tech CE", "Bachelor of Technology - Computer Engineering")
  if (!dept && courseName) {
    const withoutDegree = courseName
      .replace(/bachelor of technology/gi, "")
      .replace(/master of technology/gi, "")
      .replace(/bachelor of engineering/gi, "")
      .replace(/master of engineering/gi, "")
      .replace(/bachelor of computer applications?/gi, "")
      .replace(/master of computer applications?/gi, "")
      .replace(/bachelor of business administration/gi, "")
      .replace(/master of business administration/gi, "")
      .replace(/bachelor of science/gi, "")
      .replace(/master of science/gi, "")
      .replace(/bachelor of pharmacy/gi, "")
      .replace(/bachelor of dental surgery/gi, "")
      .replace(/doctor of philosophy/gi, "")
      .replace(/^b\.?tech/i, "")
      .replace(/^m\.?tech/i, "")
      .replace(/^b\.?e\.?/i, "")
      .replace(/^m\.?e\.?/i, "")
      .replace(/^bca/i, "")
      .replace(/^mca/i, "")
      .replace(/^bba/i, "")
      .replace(/^mba/i, "")
      .replace(/^b\.?sc/i, "")
      .replace(/^m\.?sc/i, "")
      .replace(/^b\.?pharm/i, "")
      .replace(/^bds/i, "")
      .replace(/^phd/i, "")
      .replace(/[\(\)\-\–\—\:\,]/g, " ")
      .trim();

    if (withoutDegree) {
      dept = parseDept(withoutDegree);
    }
  }

  if (degree && dept) {
    if (degree.toLowerCase().includes(dept.toLowerCase())) return degree;
    return `${degree} ${dept}`;
  }

  if (degree) return degree;
  if (dept) return dept;
  return "Student";
};

export interface UserProfileData {
  userId: string;
  handle: string;
  name: string;
  fullName: string;
  initials: string;
  collegeId?: string;
  college: string;
  collegeName: string;
  collegeShort: string;
  collegeShortName: string;
  collegeSlug?: string;
  courseId?: string;
  course: string;
  courseName: string;
  courseShortName?: string;
  branchId?: string;
  branch?: string;
  branchName?: string;
  branchShortName?: string;
  currentYear?: number;
  defaultBio: string;
  bioExtra?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  memoryBookEmail?: string;
  customLinks?: string;
  contactDetails?: string;
  isPublic?: boolean;
}

export interface PublicStudentProfile {
  id?: string;
  userId: string;
  handle?: string;
  slug: string;
  fullName: string;
  name: string;
  initials: string;
  courseId?: string;
  courseName: string;
  courseShortName?: string;
  branchId?: string;
  branchName?: string;
  branchShortName?: string;
  collegeName: string;
  collegeShortName?: string;
  currentYear?: number;
  defaultBio: string;
  bio?: string;
  bioExtra?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  customLinks?: string;
  contactDetails?: string;
}

export interface ProfileHeaderData {
  userId: string;
  handle: string;
  name: string;
  fullName: string;
  initials: string;
  gender?: string;
  collegeId?: string;
  college: string;
  collegeName: string;
  collegeShort: string;
  collegeShortName: string;
  collegeSlug?: string;
  courseId?: string;
  course: string;
  courseName: string;
  courseShortName: string;
  branchId?: string;
  branch?: string;
  branchName?: string;
  branchShortName?: string;
  currentYear?: number;
  defaultBio: string;
  avatarUrl?: string;
  isPublic: boolean;
}

export interface ProfileAboutData {
  userId: string;
  bioExtra?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  memoryBookEmail?: string;
  customLinks?: string;
  contactDetails?: string;
}

export interface PublicStudentHeaderData {
  userId: string;
  handle: string;
  slug: string;
  name: string;
  fullName: string;
  initials: string;
  courseName: string;
  courseShortName?: string;
  branchName?: string;
  branchShortName?: string;
  collegeName: string;
  collegeShortName?: string;
  collegeSlug?: string;
  currentYear?: number;
  defaultBio: string;
  avatarUrl?: string;
}

export interface PublicStudentAboutData {
  userId: string;
  handle: string;
  bioExtra?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  customLinks?: string;
  contactDetails?: string;
}

export const getMyProfileHeader = async (): Promise<ProfileHeaderData> => {
  const p = await request<any>("/profiles/me/header");
  const collegeName = p.collegeName || "Dharmsinh Desai University";
  const collegeShort = p.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((w: string) => w[0]).join(""));
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);

  return {
    userId: p.userId,
    handle: p.handle || "",
    name: p.fullName || "User",
    fullName: p.fullName || "User",
    initials: p.initials || "U",
    gender: p.gender,
    collegeId: p.collegeId,
    college: collegeName,
    collegeName: collegeName,
    collegeShort: collegeShort,
    collegeShortName: collegeShort,
    collegeSlug: p.collegeSlug,
    courseId: p.courseId,
    course: shortCourse,
    courseName: shortCourse,
    courseShortName: shortCourse,
    branchId: p.branchId,
    branch: p.branchName,
    branchName: p.branchName,
    branchShortName: p.branchShortName,
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    avatarUrl: p.avatarUrl,
    isPublic: p.public !== undefined ? p.public : true,
  };
};

export const getMyProfileAbout = async (): Promise<ProfileAboutData> => {
  const p = await request<any>("/profiles/me/about");
  return {
    userId: p.userId,
    bioExtra: p.bioExtra || "",
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    memoryBookEmail: p.memoryBookEmail || "",
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
  };
};

export const getStudentHeaderBySlug = async (slug: string): Promise<PublicStudentHeaderData> => {
  const p = await request<any>(`/students/${encodeURIComponent(slug)}/header`);
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);
  return {
    userId: p.userId,
    handle: p.handle || p.slug || slug,
    slug: p.slug || p.handle || slug,
    fullName: p.fullName || "Student",
    name: p.fullName || "Student",
    initials: p.initials || "U",
    courseName: shortCourse,
    courseShortName: shortCourse,
    branchName: p.branchName,
    branchShortName: p.branchShortName,
    collegeName: p.collegeName || "Dharmsinh Desai University",
    collegeShortName: p.collegeShortName || "DDU",
    collegeSlug: p.collegeSlug,
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    avatarUrl: p.avatarUrl,
  };
};

export const getStudentAboutBySlug = async (slug: string): Promise<PublicStudentAboutData> => {
  const p = await request<any>(`/students/${encodeURIComponent(slug)}/about`);
  return {
    userId: p.userId,
    handle: p.handle || slug,
    bioExtra: p.bioExtra || "",
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
  };
};

export const getProfile = async (): Promise<UserProfileData> => {
  const p = await request<any>("/profiles/me");
  const collegeName = p.collegeName || "Dharmsinh Desai University";
  const collegeShort = p.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((w: string) => w[0]).join(""));
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);

  return {
    userId: p.userId,
    handle: p.handle || "",
    name: p.fullName || "User",
    fullName: p.fullName || "User",
    initials: p.initials || "U",
    collegeId: p.collegeId,
    college: collegeName,
    collegeName: collegeName,
    collegeShort: collegeShort,
    collegeShortName: collegeShort,
    collegeSlug: p.collegeSlug,
    courseId: p.courseId,
    course: shortCourse,
    courseName: shortCourse,
    courseShortName: shortCourse,
    branchId: p.branchId,
    branch: p.branchName,
    branchName: p.branchName,
    branchShortName: p.branchShortName,
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    bioExtra: p.bioExtra || "",
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    memoryBookEmail: p.memoryBookEmail || "",
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
    isPublic: p.public,
  };
};

export const updateProfile = async (data: Partial<UserProfileData>): Promise<UserProfileData> => {
  const p = await request<any>("/profiles/me", {
    method: "PATCH",
    body: JSON.stringify({
      fullName: data.fullName || data.name,
      courseId: data.courseId,
      branchId: data.branchId,
      currentYear: data.currentYear,
      defaultBio: data.defaultBio,
      bioExtra: data.bioExtra,
      avatarUrl: data.avatarUrl,
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl,
      websiteUrl: data.websiteUrl,
      customLinks: data.customLinks,
      contactDetails: data.contactDetails,
      isPublic: data.isPublic,
    }),
  });
  const collegeName = p.collegeName || data.collegeName || "Dharmsinh Desai University";
  const collegeShort = p.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((w: string) => w[0]).join(""));

  return {
    userId: p.userId,
    handle: p.handle || "",
    name: p.fullName || "User",
    fullName: p.fullName || "User",
    initials: p.initials || "U",
    collegeId: p.collegeId || data.collegeId,
    college: collegeName,
    collegeName: collegeName,
    collegeShort: collegeShort,
    collegeShortName: collegeShort,
    collegeSlug: p.collegeSlug,
    courseId: p.courseId || data.courseId,
    course: normalizeCourseShort(p.courseName, p.courseShortName) || data.course || "Student",
    courseName: normalizeCourseShort(p.courseName, p.courseShortName) || data.courseName || "Student",
    courseShortName: normalizeCourseShort(p.courseName, p.courseShortName) || data.courseShortName || "Student",
    branchId: p.branchId || data.branchId,
    branch: p.branchName || data.branch,
    branchName: p.branchName || data.branchName,
    branchShortName: p.branchShortName || data.branchShortName,
    currentYear: p.currentYear !== undefined ? p.currentYear : data.currentYear,
    defaultBio: p.defaultBio || data.defaultBio || "",
    bioExtra: p.bioExtra || data.bioExtra || "",
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    memoryBookEmail: p.memoryBookEmail || "",
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
    isPublic: p.public !== undefined ? p.public : data.isPublic,
  };
};

export const sendPasswordChangeOtp = async (): Promise<{ message: string }> => {
  return request<{ message: string }>("/auth/password/change-otp/send", {
    method: "POST",
  });
};

export const changePasswordWithOtp = async (otp: string, newPassword: string): Promise<{ message: string }> => {
  return request<{ message: string }>("/auth/password/change-with-otp", {
    method: "POST",
    body: JSON.stringify({ otp, newPassword }),
  });
};

export const sendMemoryBookOtp = async (email: string): Promise<{ message: string }> => {
  return request<{ message: string }>("/profiles/me/memory-book-email/otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const verifyMemoryBookEmail = async (email: string, otp: string): Promise<UserProfileData> => {
  const p = await request<any>("/profiles/me/memory-book-email/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  const collegeName = p.collegeName || "Dharmsinh Desai University";
  const collegeShort = p.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((w: string) => w[0]).join(""));
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);

  return {
    userId: p.userId,
    handle: p.handle || "",
    name: p.fullName || "User",
    fullName: p.fullName || "User",
    initials: p.initials || "U",
    college: collegeName,
    collegeName: collegeName,
    collegeShort: collegeShort,
    collegeShortName: collegeShort,
    collegeSlug: p.collegeSlug,
    course: shortCourse,
    courseName: shortCourse,
    courseShortName: shortCourse,
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    bioExtra: p.bioExtra || "",
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    memoryBookEmail: p.memoryBookEmail || "",
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
    isPublic: p.public,
  };
};

export const removeMemoryBookEmail = async (): Promise<UserProfileData> => {
  const p = await request<any>("/profiles/me/memory-book-email", {
    method: "DELETE",
  });
  const collegeName = p.collegeName || "Dharmsinh Desai University";
  const collegeShort = p.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((w: string) => w[0]).join(""));
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);

  return {
    userId: p.userId,
    handle: p.handle || "",
    name: p.fullName || "User",
    fullName: p.fullName || "User",
    initials: p.initials || "U",
    college: collegeName,
    collegeName: collegeName,
    collegeShort: collegeShort,
    collegeShortName: collegeShort,
    collegeSlug: p.collegeSlug,
    course: shortCourse,
    courseName: shortCourse,
    courseShortName: shortCourse,
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    bioExtra: p.bioExtra || "",
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    memoryBookEmail: p.memoryBookEmail || "",
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
    isPublic: p.public,
  };
};

export const getStudentBySlug = async (slug: string): Promise<PublicStudentProfile> => {
  const p = await request<any>(`/students/${encodeURIComponent(slug)}`);
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);
  return {
    id: p.userId,
    userId: p.userId,
    handle: p.handle || p.slug || slug,
    slug: p.slug || p.handle || slug,
    fullName: p.fullName || "Student",
    name: p.fullName || "Student",
    initials: p.initials || "U",
    courseName: shortCourse,
    courseShortName: shortCourse,
    branchName: p.branchName,
    branchShortName: p.branchShortName,
    collegeName: p.collegeName || "Dharmsinh Desai University",
    collegeShortName: p.collegeShortName || "DDU",
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    bio: p.bioExtra || p.defaultBio || "",
    bioExtra: p.bioExtra || "",
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
  };
};

export const getCampusStudents = async (): Promise<PublicStudentProfile[]> => {
  const list = await request<any[]>("/campus/students");
  if (!Array.isArray(list)) return [];
  return list.map((p) => {
    const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);
    return {
      id: p.userId,
      userId: p.userId,
      handle: p.handle || p.slug || "",
      slug: p.slug || p.handle || "",
      fullName: p.fullName || "Student",
      name: p.fullName || "Student",
      initials: p.initials || "U",
      courseName: shortCourse,
      courseShortName: shortCourse,
      branchName: p.branchName,
      branchShortName: p.branchShortName,
      collegeName: p.collegeName || "Dharmsinh Desai University",
      collegeShortName: p.collegeShortName || "DDU",
      currentYear: p.currentYear,
      defaultBio: p.defaultBio || "",
      bio: p.bioExtra || p.defaultBio || "",
      bioExtra: p.bioExtra || "",
      avatarUrl: p.avatarUrl,
      githubUrl: p.githubUrl,
      linkedinUrl: p.linkedinUrl,
      websiteUrl: p.websiteUrl,
    };
  });
};

// ---------------------------------------------------------------------------