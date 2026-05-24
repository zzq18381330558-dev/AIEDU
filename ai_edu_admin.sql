--
-- PostgreSQL database dump
--

\restrict XX7U2ULyeHhJ3t2Zexs1T8oQZyFM4WLzoFnRbrChmkIIrH1nxrr1mJyeWOuLj0c

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AttendanceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AttendanceStatus" AS ENUM (
    'PRESENT',
    'LATE',
    'ABSENT',
    'LEAVE'
);


--
-- Name: CampusBusinessType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CampusBusinessType" AS ENUM (
    'DIRECT',
    'FRANCHISE'
);


--
-- Name: CampusStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CampusStatus" AS ENUM (
    'ACTIVE',
    'DISABLED'
);


--
-- Name: ContentExportFormat; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContentExportFormat" AS ENUM (
    'WORD',
    'PDF',
    'PPT'
);


--
-- Name: ContentReviewAction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContentReviewAction" AS ENUM (
    'SUBMIT',
    'APPROVE',
    'REJECT',
    'ARCHIVE'
);


--
-- Name: ContentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContentStatus" AS ENUM (
    'DRAFT',
    'REVIEWING',
    'PUBLISHED',
    'ARCHIVED',
    'APPROVED'
);


--
-- Name: CourseSessionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CourseSessionType" AS ENUM (
    'LIVE',
    'RECORDED',
    'PRACTICE',
    'MOCK_EXAM'
);


--
-- Name: DictionaryCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DictionaryCategory" AS ENUM (
    'SCHOOL',
    'MAJOR',
    'EXAM_TRACK',
    'LEAD_SOURCE',
    'QUESTION_TYPE',
    'DIFFICULTY',
    'CLASS_TYPE',
    'V06_CAT_WITH_ITEM'
);


--
-- Name: LeadExamTrack; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadExamTrack" AS ENUM (
    'INFANT',
    'PRIMARY',
    'MIDDLE'
);


--
-- Name: LeadIntentLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadIntentLevel" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'STRONG'
);


--
-- Name: LeadSourceChannel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadSourceChannel" AS ENUM (
    'UNIVERSITY_PARTNERSHIP',
    'CAMPUS_PROMOTION',
    'WECHAT_MOMENTS',
    'SHORT_VIDEO',
    'GROUND_PROMOTION',
    'ENTERPRISE_WECHAT',
    'REFERRAL',
    'OTHER'
);


--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'UNCONTACTED',
    'CONTACTED',
    'TRIAL',
    'CONSIDERING',
    'WON',
    'LOST'
);


--
-- Name: PaperStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaperStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


--
-- Name: QuestionSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QuestionSource" AS ENUM (
    'REAL_EXAM',
    'MOCK',
    'ORIGINAL'
);


--
-- Name: QuestionSubject; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QuestionSubject" AS ENUM (
    'COMPREHENSIVE_QUALITY',
    'EDUCATION_KNOWLEDGE',
    'SUBJECT_KNOWLEDGE',
    'INTERVIEW_STRUCTURED',
    'TRIAL_LECTURE',
    'DEFENSE'
);


--
-- Name: QuestionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QuestionType" AS ENUM (
    'SINGLE_CHOICE',
    'MATERIAL_ANALYSIS',
    'WRITING',
    'SHORT_ANSWER',
    'DISCRIMINATION',
    'CASE_ANALYSIS'
);


--
-- Name: ReminderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReminderStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED',
    'CANCELLED'
);


--
-- Name: ReminderType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReminderType" AS ENUM (
    'CLASS',
    'HOMEWORK',
    'CHECK_IN',
    'ABSENCE',
    'EXAM',
    'STUDY_PLAN'
);


--
-- Name: ServiceTicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ServiceTicketStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


--
-- Name: SopCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SopCategory" AS ENUM (
    'NEW_CAMPUS_LAUNCH',
    'UNIVERSITY_COOPERATION',
    'GROUND_PROMOTION',
    'MOMENTS_OPERATION',
    'CONSULTATION_CONVERSION',
    'STUDENT_ONBOARDING',
    'CLASS_SERVICE',
    'CHECK_IN_SUPERVISION',
    'EXAM_SPRINT',
    'INTERVIEW_SERVICE',
    'REFUND_COMPLAINT'
);


--
-- Name: SopStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SopStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'RETIRED'
);


--
-- Name: SopTaskStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SopTaskStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'DONE',
    'BLOCKED'
);


--
-- Name: StudentStudyStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StudentStudyStatus" AS ENUM (
    'NOT_STARTED',
    'STUDYING',
    'PAUSED',
    'COMPLETED',
    'REFUNDED',
    'LOW_ACTIVE',
    'SPRINT',
    'INTERVIEW_STAGE'
);


--
-- Name: TeachingContentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TeachingContentType" AS ENUM (
    'COURSE_HANDOUT',
    'PPT_OUTLINE',
    'REAL_EXAM_ANALYSIS',
    'MOCK_PAPER',
    'WRITING_TEMPLATE',
    'INTERVIEW_STRUCTURED_TEMPLATE',
    'SHORT_VIDEO_SCRIPT',
    'SALES_MOMENTS_COPY',
    'SALES_POSTER_COPY'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'CAMPUS_MANAGER',
    'ADMISSIONS_COUNSELOR',
    'ACADEMIC_TEACHER',
    'LECTURER'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'DISABLED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AnalyticsDailyReport; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AnalyticsDailyReport" (
    id text NOT NULL,
    "reportDate" timestamp(3) without time zone NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    metrics jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AnalyticsMetric; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AnalyticsMetric" (
    id text NOT NULL,
    scope text NOT NULL,
    "metricKey" text NOT NULL,
    "metricValue" numeric(12,2) NOT NULL,
    "measuredAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AttendanceRecord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AttendanceRecord" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "courseSessionId" text NOT NULL,
    "recorderId" text,
    status public."AttendanceStatus" DEFAULT 'PRESENT'::public."AttendanceStatus" NOT NULL,
    "checkInAt" timestamp(3) without time zone,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BusinessDictionary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BusinessDictionary" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    category public."DictionaryCategory" NOT NULL,
    name text NOT NULL,
    value text,
    enabled boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BusinessDictionaryCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BusinessDictionaryCategory" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Campus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Campus" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    city text NOT NULL,
    address text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "managerId" text,
    "contactPhone" text,
    status public."CampusStatus" DEFAULT 'ACTIVE'::public."CampusStatus" NOT NULL,
    "businessType" public."CampusBusinessType" DEFAULT 'DIRECT'::public."CampusBusinessType" NOT NULL
);


--
-- Name: CampusAssistant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CampusAssistant" (
    id text NOT NULL,
    "campusId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CourseSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CourseSession" (
    id text NOT NULL,
    "campusId" text NOT NULL,
    "classId" text NOT NULL,
    "lecturerId" text,
    title text NOT NULL,
    type public."CourseSessionType" DEFAULT 'LIVE'::public."CourseSessionType" NOT NULL,
    "startsAt" timestamp(3) without time zone NOT NULL,
    "endsAt" timestamp(3) without time zone NOT NULL,
    room text,
    homework text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ExamPaper; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExamPaper" (
    id text NOT NULL,
    "questionBankId" text,
    title text NOT NULL,
    subject public."QuestionSubject" NOT NULL,
    "totalScore" integer DEFAULT 100 NOT NULL,
    "durationMinutes" integer DEFAULT 120 NOT NULL,
    status public."PaperStatus" DEFAULT 'DRAFT'::public."PaperStatus" NOT NULL,
    strategy jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paperType" text DEFAULT 'MOCK'::text NOT NULL,
    stage text,
    year integer,
    region text,
    source text,
    "questionCount" integer DEFAULT 0 NOT NULL,
    difficulty text DEFAULT 'MEDIUM'::text NOT NULL,
    description text
);


--
-- Name: ExamPaperQuestion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExamPaperQuestion" (
    id text NOT NULL,
    "paperId" text NOT NULL,
    "questionId" text NOT NULL,
    "sortOrder" integer NOT NULL,
    score integer DEFAULT 2 NOT NULL
);


--
-- Name: Lead; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    "campusId" text NOT NULL,
    "creatorId" text NOT NULL,
    "assigneeId" text,
    name text NOT NULL,
    phone text NOT NULL,
    status public."LeadStatus" DEFAULT 'UNCONTACTED'::public."LeadStatus" NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    wechat text,
    school text,
    grade text,
    major text,
    "examTrack" public."LeadExamTrack" DEFAULT 'PRIMARY'::public."LeadExamTrack" NOT NULL,
    "sourceChannel" public."LeadSourceChannel" NOT NULL,
    "intentLevel" public."LeadIntentLevel" DEFAULT 'MEDIUM'::public."LeadIntentLevel" NOT NULL,
    "lastFollowedAt" timestamp(3) without time zone,
    "nextFollowUpAt" timestamp(3) without time zone
);


--
-- Name: LeadFollowUp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LeadFollowUp" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    content text NOT NULL,
    "nextAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "creatorId" text NOT NULL,
    status public."LeadStatus" NOT NULL,
    "intentLevel" public."LeadIntentLevel" NOT NULL,
    "followAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Organization; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Organization" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Question; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Question" (
    id text NOT NULL,
    "questionBankId" text,
    type public."QuestionType" NOT NULL,
    stem text NOT NULL,
    answer text NOT NULL,
    analysis text,
    difficulty integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    subject public."QuestionSubject" NOT NULL,
    chapter text NOT NULL,
    "knowledgePoint" text NOT NULL,
    options jsonb,
    "highFrequencyTags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
    source public."QuestionSource" DEFAULT 'ORIGINAL'::public."QuestionSource" NOT NULL,
    year integer,
    "paperId" text,
    "questionNo" text,
    score integer
);


--
-- Name: QuestionBank; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."QuestionBank" (
    id text NOT NULL,
    name text NOT NULL,
    "examTrack" public."LeadExamTrack" DEFAULT 'PRIMARY'::public."LeadExamTrack" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    subject public."QuestionSubject" DEFAULT 'COMPREHENSIVE_QUALITY'::public."QuestionSubject" NOT NULL
);


--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RolePermission" (
    id text NOT NULL,
    role public."UserRole" NOT NULL,
    module text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ServiceTicket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ServiceTicket" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "ownerId" text,
    title text NOT NULL,
    status public."ServiceTicketStatus" DEFAULT 'OPEN'::public."ServiceTicketStatus" NOT NULL,
    "aiSuggestion" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SopExecution; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SopExecution" (
    id text NOT NULL,
    "sopTemplateId" text NOT NULL,
    "campusId" text NOT NULL,
    owner text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SopInspection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SopInspection" (
    id text NOT NULL,
    "sopTemplateId" text NOT NULL,
    "sopExecutionId" text,
    "inspectorId" text NOT NULL,
    score integer NOT NULL,
    checklist jsonb NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: SopStep; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SopStep" (
    id text NOT NULL,
    "sopTemplateId" text NOT NULL,
    title text NOT NULL,
    description text,
    "sortOrder" integer NOT NULL,
    standard text,
    "ownerRole" text
);


--
-- Name: SopTask; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SopTask" (
    id text NOT NULL,
    "sopTemplateId" text NOT NULL,
    "sopExecutionId" text,
    "campusId" text NOT NULL,
    title text NOT NULL,
    description text,
    status public."SopTaskStatus" DEFAULT 'TODO'::public."SopTaskStatus" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SopTaskCheckIn; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SopTaskCheckIn" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "userId" text NOT NULL,
    note text NOT NULL,
    evidence text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: SopTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SopTemplate" (
    id text NOT NULL,
    title text NOT NULL,
    module text NOT NULL,
    status public."SopStatus" DEFAULT 'DRAFT'::public."SopStatus" NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category public."SopCategory" NOT NULL,
    summary text,
    document text
);


--
-- Name: SopWeeklyReport; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SopWeeklyReport" (
    id text NOT NULL,
    "sopTemplateId" text NOT NULL,
    "sopExecutionId" text,
    "campusId" text NOT NULL,
    "reporterId" text NOT NULL,
    "weekStart" timestamp(3) without time zone NOT NULL,
    summary text NOT NULL,
    blockers text,
    "nextPlan" text,
    metrics jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Student; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    "campusId" text NOT NULL,
    "leadId" text,
    name text NOT NULL,
    phone text NOT NULL,
    school text,
    major text,
    "examTrack" public."LeadExamTrack" DEFAULT 'PRIMARY'::public."LeadExamTrack" NOT NULL,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "classId" text,
    "academicOwnerId" text,
    "salesOwnerId" text,
    grade text,
    "classType" text,
    "studyStatus" public."StudentStudyStatus" DEFAULT 'NOT_STARTED'::public."StudentStudyStatus" NOT NULL,
    "serviceNote" text,
    "idNumber" text
);


--
-- Name: StudentClass; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StudentClass" (
    id text NOT NULL,
    "campusId" text NOT NULL,
    name text NOT NULL,
    "startAt" timestamp(3) without time zone NOT NULL,
    "academicOwnerId" text,
    "lecturerId" text,
    "classType" text,
    "examTrack" public."LeadExamTrack" DEFAULT 'PRIMARY'::public."LeadExamTrack" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: StudentReminder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StudentReminder" (
    id text NOT NULL,
    "studentId" text,
    "classId" text,
    "courseSessionId" text,
    "creatorId" text,
    type public."ReminderType" NOT NULL,
    status public."ReminderStatus" DEFAULT 'PENDING'::public."ReminderStatus" NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    "pushedAt" timestamp(3) without time zone,
    channel text DEFAULT 'WECHAT_RESERVED'::text NOT NULL,
    provider text DEFAULT 'OPENCLAW_RESERVED'::text NOT NULL,
    "providerPayload" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: StudyPlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StudyPlan" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    title text NOT NULL,
    "aiSummary" text,
    progress integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "planText" text,
    "serviceScript" text
);


--
-- Name: TeachingContent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeachingContent" (
    id text NOT NULL,
    "authorId" text NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    status public."ContentStatus" DEFAULT 'DRAFT'::public."ContentStatus" NOT NULL,
    "aiPrompt" text,
    body text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    type public."TeachingContentType" NOT NULL,
    summary text,
    "currentVersion" integer DEFAULT 1 NOT NULL
);


--
-- Name: TeachingContentExport; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeachingContentExport" (
    id text NOT NULL,
    "contentId" text NOT NULL,
    format public."ContentExportFormat" NOT NULL,
    "fileName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TeachingContentPublication; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeachingContentPublication" (
    id text NOT NULL,
    "contentId" text NOT NULL,
    "campusId" text NOT NULL,
    "publishedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TeachingContentReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeachingContentReview" (
    id text NOT NULL,
    "contentId" text NOT NULL,
    "reviewerId" text NOT NULL,
    action public."ContentReviewAction" NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TeachingContentTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeachingContentTemplate" (
    id text NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    chapter text NOT NULL,
    type public."TeachingContentType" NOT NULL,
    "structureMarkdown" text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TeachingContentVersion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeachingContentVersion" (
    id text NOT NULL,
    "contentId" text NOT NULL,
    version integer NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    "changeNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TeachingKeyPoint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeachingKeyPoint" (
    id text NOT NULL,
    subject text NOT NULL,
    chapter text NOT NULL,
    name text NOT NULL,
    frequency integer NOT NULL,
    "questionTypes" text NOT NULL,
    direction text NOT NULL,
    mistakes text NOT NULL,
    keywords text NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "campusId" text,
    name text NOT NULL,
    phone text,
    "passwordHash" text NOT NULL,
    role public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "idNumber" text
);


--
-- Name: UserPermission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserPermission" (
    id text NOT NULL,
    "userId" text NOT NULL,
    module text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WrongQuestionRecord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WrongQuestionRecord" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "questionId" text NOT NULL,
    answer text,
    reason text,
    mastered boolean DEFAULT false NOT NULL,
    "wrongAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: AnalyticsDailyReport; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AnalyticsDailyReport" (id, "reportDate", title, summary, metrics, "createdAt", "updatedAt") FROM stdin;
cmph5nhk00000wudbogc37gkl	2026-05-22 16:00:00	2026-05-22 每日经营日报	新增线索 0 条，有效咨询 0 条，成交 1 人，转化率 0%。\n预估成交金额 2980 元，校区利润估算 960.6 元。\n到课率 100%，打卡率 100%，作业完成率 100%。	{"overview": {"profit": 960.6, "revenue": 2980, "refundRate": 0, "teacherFee": 440, "checkInRate": 100, "newLeadCount": 0, "wonLeadCount": 1, "attendanceRate": 100, "conversionRate": 0, "universityShare": 536.4, "effectiveConsultCount": 0, "homeworkCompletionRate": 100}, "classRows": [{"name": "小学教资周末冲刺班", "studentCount": 1, "attendanceRate": 100}], "campusRows": [], "channelRows": [], "counselorRows": []}	2026-05-22 16:49:47.424	2026-05-22 16:49:51.726
\.


--
-- Data for Name: AnalyticsMetric; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AnalyticsMetric" (id, scope, "metricKey", "metricValue", "measuredAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: AttendanceRecord; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AttendanceRecord" (id, "studentId", "courseSessionId", "recorderId", status, "checkInAt", note, "createdAt", "updatedAt") FROM stdin;
cmph8i5tj000hc4yvjrtnebny	cmph8fliz0001c4yv0q1ff3xl	seed-course-session-001	cmph2tvrp0004aptp3qiig9tq	PRESENT	2026-05-19 18:09:00	\N	2026-05-22 18:09:37.783	2026-05-22 18:10:02.254
\.


--
-- Data for Name: BusinessDictionary; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BusinessDictionary" (id, "organizationId", category, name, value, enabled, "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmphazxvp000gph7gingq2hvx	cmph2tvrd0000aptp4f65dcn2	SCHOOL	上海师范大学	SHNU	t	1	2026-05-22 19:19:26.533	2026-05-24 00:19:00.555
cmphazxvr000iph7g3nzsd4rk	cmph2tvrd0000aptp4f65dcn2	SCHOOL	华东师范大学	ECNU	t	2	2026-05-22 19:19:26.535	2026-05-24 00:19:00.56
cmphazxvs000kph7g2sott382	cmph2tvrd0000aptp4f65dcn2	MAJOR	汉语言文学	CHINESE_LANGUAGE	t	1	2026-05-22 19:19:26.536	2026-05-24 00:19:00.561
cmphazxvs000mph7gryiaqghy	cmph2tvrd0000aptp4f65dcn2	MAJOR	小学教育	PRIMARY_EDUCATION	t	2	2026-05-22 19:19:26.537	2026-05-24 00:19:00.563
cmphazxvt000oph7g0hxqwrhy	cmph2tvrd0000aptp4f65dcn2	EXAM_TRACK	幼儿	INFANT	t	1	2026-05-22 19:19:26.538	2026-05-24 00:19:00.564
cmphazxvu000qph7gkm7cph8p	cmph2tvrd0000aptp4f65dcn2	EXAM_TRACK	小学	PRIMARY	t	2	2026-05-22 19:19:26.538	2026-05-24 00:19:00.565
cmphazxvv000sph7g94eo8g8v	cmph2tvrd0000aptp4f65dcn2	EXAM_TRACK	中学	MIDDLE	t	3	2026-05-22 19:19:26.539	2026-05-24 00:19:00.567
cmphazxvv000uph7gt05plm41	cmph2tvrd0000aptp4f65dcn2	LEAD_SOURCE	高校合作	UNIVERSITY_PARTNERSHIP	t	1	2026-05-22 19:19:26.54	2026-05-24 00:19:00.568
cmphazxvw000wph7gbznk3qpd	cmph2tvrd0000aptp4f65dcn2	LEAD_SOURCE	地推	GROUND_PROMOTION	t	2	2026-05-22 19:19:26.54	2026-05-24 00:19:00.57
cmphazxvw000yph7gmt6v1bs9	cmph2tvrd0000aptp4f65dcn2	QUESTION_TYPE	单选题	SINGLE_CHOICE	t	1	2026-05-22 19:19:26.541	2026-05-24 00:19:00.571
cmphazxvx0010ph7g2330x09k	cmph2tvrd0000aptp4f65dcn2	QUESTION_TYPE	材料分析题	MATERIAL_ANALYSIS	t	2	2026-05-22 19:19:26.542	2026-05-24 00:19:00.572
cmphazxvy0012ph7gcblnny2s	cmph2tvrd0000aptp4f65dcn2	DIFFICULTY	基础	1	t	1	2026-05-22 19:19:26.542	2026-05-24 00:19:00.573
cmphazxvy0014ph7gcymf81c3	cmph2tvrd0000aptp4f65dcn2	DIFFICULTY	中等	3	t	2	2026-05-22 19:19:26.543	2026-05-24 00:19:00.575
cmphazxvz0016ph7gpwn0i8u8	cmph2tvrd0000aptp4f65dcn2	CLASS_TYPE	周末班	WEEKEND	t	1	2026-05-22 19:19:26.543	2026-05-24 00:19:00.576
cmphazxvz0018ph7gybt9etxc	cmph2tvrd0000aptp4f65dcn2	CLASS_TYPE	冲刺班	SPRINT	t	2	2026-05-22 19:19:26.544	2026-05-24 00:19:00.577
\.


--
-- Data for Name: BusinessDictionaryCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BusinessDictionaryCategory" (id, code, name, "isSystem", "createdAt", "updatedAt") FROM stdin;
system-dict-category-school	SCHOOL	院校名称	t	2026-05-24 09:21:43.174	2026-05-24 09:21:43.174
system-dict-category-major	MAJOR	专业名称	t	2026-05-24 09:21:43.174	2026-05-24 09:21:43.174
system-dict-category-exam-track	EXAM_TRACK	教资方向	t	2026-05-24 09:21:43.174	2026-05-24 09:21:43.174
system-dict-category-lead-source	LEAD_SOURCE	线索来源	t	2026-05-24 09:21:43.174	2026-05-24 09:21:43.174
system-dict-category-question-type	QUESTION_TYPE	题目类型	t	2026-05-24 09:21:43.174	2026-05-24 09:21:43.174
system-dict-category-difficulty	DIFFICULTY	难度等级	t	2026-05-24 09:21:43.174	2026-05-24 09:21:43.174
system-dict-category-class-type	CLASS_TYPE	课程类型	t	2026-05-24 09:21:43.174	2026-05-24 09:21:43.174
\.


--
-- Data for Name: Campus; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Campus" (id, "organizationId", name, code, city, address, "createdAt", "updatedAt", "managerId", "contactPhone", status, "businessType") FROM stdin;
cmph2tvrl0002aptpqky8hzkp	cmph2tvrd0000aptp4f65dcn2	总部校区	HQ	上海	总部运营中心	2026-05-22 15:30:46.929	2026-05-24 08:00:22.731	cmph2tvrp0004aptp3qiig9tq	021-00000000	ACTIVE	DIRECT
cmphc1m96000121dpbu81xudf	cmph2tvrd0000aptp4f65dcn2	西华大学	XH	成都	\N	2026-05-22 19:48:44.394	2026-05-24 08:00:22.731	cmph2tvrp0004aptp3qiig9tq	\N	ACTIVE	DIRECT
\.


--
-- Data for Name: CampusAssistant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CampusAssistant" (id, "campusId", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CourseSession; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CourseSession" (id, "campusId", "classId", "lecturerId", title, type, "startsAt", "endsAt", room, homework, "createdAt", "updatedAt") FROM stdin;
seed-course-session-001	cmph2tvrl0002aptpqky8hzkp	seed-student-class-primary	cmph2tvrp0004aptp3qiig9tq	综合素质材料分析专项课	LIVE	2026-06-06 11:00:00	2026-06-06 13:00:00	腾讯会议	完成材料分析真题 2 组，提交错题截图。	2026-05-22 15:58:48.531	2026-05-24 08:00:22.731
\.


--
-- Data for Name: ExamPaper; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ExamPaper" (id, "questionBankId", title, subject, "totalScore", "durationMinutes", status, strategy, "createdAt", "updatedAt", "paperType", stage, year, region, source, "questionCount", difficulty, description) FROM stdin;
seed-paper-001	seed-question-bank	综合素质高频考点练习卷	COMPREHENSIVE_QUALITY	20	30	DRAFT	\N	2026-05-22 16:12:37.924	2026-05-22 16:12:37.924	MOCK	\N	\N	\N	\N	0	MEDIUM	\N
cmpi39woz0001140r40fdgff9	\N	综合素质	COMPREHENSIVE_QUALITY	150	120	DRAFT	\N	2026-05-23 08:31:00.803	2026-05-23 08:31:00.803	REAL_EXAM	MIDDLE	2026	全国	\N	0	MEDIUM	\N
\.


--
-- Data for Name: ExamPaperQuestion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ExamPaperQuestion" (id, "paperId", "questionId", "sortOrder", score) FROM stdin;
cmph4bp9f000lvin6k9cj6cho	seed-paper-001	seed-question-001	1	2
cmph4bp9f000mvin6042wvo0o	seed-paper-001	seed-question-002	2	8
cmph4bp9m000ovin6mlfttks1	seed-paper-001	seed-question-003	3	5
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Lead" (id, "campusId", "creatorId", "assigneeId", name, phone, status, note, "createdAt", "updatedAt", wechat, school, grade, major, "examTrack", "sourceChannel", "intentLevel", "lastFollowedAt", "nextFollowUpAt") FROM stdin;
cmph7qhsc0003qvf03qzi9v48	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	ff	dfsf	UNCONTACTED	\N	2026-05-22 17:48:06.924	2026-05-22 17:57:24.291	df	sfds	dsfd	sdfdsf	PRIMARY	OTHER	MEDIUM	\N	2026-05-22 17:48:00
cmph7or6e0001qvf04ij4u7un	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	张三	183813305589	WON	122	2026-05-22 17:46:45.783	2026-05-22 18:21:14.356	7987987	97897	9787	89789	PRIMARY	OTHER	MEDIUM	2026-05-22 18:21:14.355	2026-05-27 17:46:00
cmphd3cj200032gl0lm3t8u1j	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生1	13826298555	UNCONTACTED	\N	2026-05-22 20:18:04.718	2026-05-22 20:18:04.718	\N	成都理工大学	大三	市场营销	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cja00052gl00zyy0n32	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生2	13382493174	UNCONTACTED	\N	2026-05-22 20:18:04.726	2026-05-22 20:18:04.726	\N	电子科技大学	大二	市场营销	INFANT	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cjc00072gl0op5gtcre	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生3	13525124859	UNCONTACTED	\N	2026-05-22 20:18:04.728	2026-05-22 20:18:04.728	\N	电子科技大学	大一	市场营销	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cje00092gl0vb4rh954	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生4	13581809381	UNCONTACTED	\N	2026-05-22 20:18:04.73	2026-05-22 20:18:04.73	\N	西南财经大学	大三	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cjf000b2gl0et51yiep	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生5	13385623097	UNCONTACTED	\N	2026-05-22 20:18:04.732	2026-05-22 20:18:04.732	\N	四川大学	大一	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cjh000d2gl06iajb3r2	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生6	13342925823	UNCONTACTED	\N	2026-05-22 20:18:04.734	2026-05-22 20:18:04.734	\N	西南财经大学	大三	学前教育	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cjj000f2gl0j50zd9us	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生7	13248132103	UNCONTACTED	\N	2026-05-22 20:18:04.735	2026-05-22 20:18:04.735	\N	电子科技大学	大二	英语	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cjk000h2gl0sy81w7vu	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生8	13278783631	UNCONTACTED	\N	2026-05-22 20:18:04.737	2026-05-22 20:18:04.737	\N	四川师范大学	大一	市场营销	INFANT	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cjm000j2gl077609hgl	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生9	13500893445	UNCONTACTED	\N	2026-05-22 20:18:04.738	2026-05-22 20:18:04.738	\N	电子科技大学	大二	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cjn000l2gl0ote82mwb	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生10	13591910393	UNCONTACTED	\N	2026-05-22 20:18:04.74	2026-05-22 20:18:04.74	\N	四川大学	大三	市场营销	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cjp000n2gl0q6juj8yt	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生11	13512758799	UNCONTACTED	\N	2026-05-22 20:18:04.741	2026-05-22 20:18:04.741	\N	四川大学	大三	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cjq000p2gl0ievujsdi	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生12	13428710304	UNCONTACTED	\N	2026-05-22 20:18:04.743	2026-05-22 20:18:04.743	\N	四川师范大学	大二	学前教育	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cjs000r2gl0d6rmt0f6	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生13	13637141282	UNCONTACTED	\N	2026-05-22 20:18:04.744	2026-05-22 20:18:04.744	\N	成都理工大学	大一	市场营销	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cjt000t2gl064a8e2zk	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生14	13300767298	UNCONTACTED	\N	2026-05-22 20:18:04.746	2026-05-22 20:18:04.746	\N	四川大学	大二	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cjv000v2gl01ket4esu	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生15	13799221687	UNCONTACTED	\N	2026-05-22 20:18:04.747	2026-05-22 20:18:04.747	\N	西南财经大学	大三	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cjw000x2gl08iikig5y	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生16	13135542473	UNCONTACTED	\N	2026-05-22 20:18:04.748	2026-05-22 20:18:04.748	\N	成都理工大学	大二	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cjy000z2gl0weqtpirl	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生17	13520097960	UNCONTACTED	\N	2026-05-22 20:18:04.75	2026-05-22 20:18:04.75	\N	四川大学	大二	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cjz00112gl0pmkeapbg	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生18	13378911807	UNCONTACTED	\N	2026-05-22 20:18:04.751	2026-05-22 20:18:04.751	\N	西南财经大学	大三	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3ck100132gl01f8vm4q7	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生19	13224143740	UNCONTACTED	\N	2026-05-22 20:18:04.754	2026-05-22 20:18:04.754	\N	电子科技大学	大三	市场营销	INFANT	OTHER	MEDIUM	\N	\N
cmphd3ck300152gl02bzzifgi	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生20	13651375649	UNCONTACTED	\N	2026-05-22 20:18:04.755	2026-05-22 20:18:04.755	\N	西南财经大学	大一	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3ck400172gl0anwh9fsf	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生21	13128048494	UNCONTACTED	\N	2026-05-22 20:18:04.757	2026-05-22 20:18:04.757	\N	西南财经大学	大三	汉语言文学	INFANT	OTHER	MEDIUM	\N	\N
cmphd3ck600192gl00dbia6hd	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生22	13825600473	UNCONTACTED	\N	2026-05-22 20:18:04.758	2026-05-22 20:18:04.758	\N	四川大学	大二	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3ck7001b2gl0nvagaqy2	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生23	13748871696	UNCONTACTED	\N	2026-05-22 20:18:04.76	2026-05-22 20:18:04.76	\N	成都理工大学	大二	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3ck9001d2gl0yn6ywzlj	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生24	13247243400	UNCONTACTED	\N	2026-05-22 20:18:04.761	2026-05-22 20:18:04.761	\N	四川大学	大一	市场营销	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cka001f2gl03k5dgt16	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生25	13250384005	UNCONTACTED	\N	2026-05-22 20:18:04.763	2026-05-22 20:18:04.763	\N	四川大学	大二	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3ckc001h2gl0iezmwhsm	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生26	13410915164	UNCONTACTED	\N	2026-05-22 20:18:04.764	2026-05-22 20:18:04.764	\N	电子科技大学	大三	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cke001j2gl0hhfele6m	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生27	13281094798	UNCONTACTED	\N	2026-05-22 20:18:04.766	2026-05-22 20:18:04.766	\N	电子科技大学	大三	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3ckf001l2gl0ewypkmg4	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生28	13309511840	UNCONTACTED	\N	2026-05-22 20:18:04.767	2026-05-22 20:18:04.767	\N	西南财经大学	大三	计算机科学	INFANT	OTHER	MEDIUM	\N	\N
cmphd3ckg001n2gl0v2wdp57r	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生29	13499979247	UNCONTACTED	\N	2026-05-22 20:18:04.769	2026-05-22 20:18:04.769	\N	成都理工大学	大三	汉语言文学	INFANT	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cki001p2gl0o88flaka	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生30	13665713407	UNCONTACTED	\N	2026-05-22 20:18:04.77	2026-05-22 20:18:04.77	\N	四川师范大学	大一	计算机科学	INFANT	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3ckj001r2gl0akqcrqzh	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生31	13719166486	UNCONTACTED	\N	2026-05-22 20:18:04.772	2026-05-22 20:18:04.772	\N	西南财经大学	大三	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3ckm001t2gl0tfzrxu4u	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生32	13729647355	UNCONTACTED	\N	2026-05-22 20:18:04.775	2026-05-22 20:18:04.775	\N	四川师范大学	大二	学前教育	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cko001v2gl07mk4vwxn	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生33	13789999470	UNCONTACTED	\N	2026-05-22 20:18:04.776	2026-05-22 20:18:04.776	\N	电子科技大学	大一	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3ckp001x2gl081v39gwk	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生34	13877319037	UNCONTACTED	\N	2026-05-22 20:18:04.778	2026-05-22 20:18:04.778	\N	四川师范大学	大三	市场营销	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3ckr001z2gl0edyu2a3p	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生35	13260837070	UNCONTACTED	\N	2026-05-22 20:18:04.779	2026-05-22 20:18:04.779	\N	西南财经大学	大二	英语	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cks00212gl09uicfpr9	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生36	13983426224	UNCONTACTED	\N	2026-05-22 20:18:04.781	2026-05-22 20:18:04.781	\N	成都理工大学	大一	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cku00232gl043olcrt8	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生37	13417741070	UNCONTACTED	\N	2026-05-22 20:18:04.782	2026-05-22 20:18:04.782	\N	四川师范大学	大一	计算机科学	INFANT	OTHER	MEDIUM	\N	\N
cmphd3ckv00252gl0csmwwldx	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生38	13214764246	UNCONTACTED	\N	2026-05-22 20:18:04.784	2026-05-22 20:18:04.784	\N	四川师范大学	大一	市场营销	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3ckx00272gl0vbtsxdqr	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生39	13645869056	UNCONTACTED	\N	2026-05-22 20:18:04.785	2026-05-22 20:18:04.785	\N	四川师范大学	大二	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cky00292gl0f1h70wna	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生40	13512476366	UNCONTACTED	\N	2026-05-22 20:18:04.787	2026-05-22 20:18:04.787	\N	西南财经大学	大一	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cl0002b2gl0asubolyq	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生41	13235537526	UNCONTACTED	\N	2026-05-22 20:18:04.789	2026-05-22 20:18:04.789	\N	西南财经大学	大一	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cl2002d2gl0mk1wcgkd	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生42	13912996714	UNCONTACTED	\N	2026-05-22 20:18:04.79	2026-05-22 20:18:04.79	\N	电子科技大学	大三	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cl3002f2gl0konrb7ny	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生43	13567225517	UNCONTACTED	\N	2026-05-22 20:18:04.792	2026-05-22 20:18:04.792	\N	电子科技大学	大三	市场营销	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cl5002h2gl0fbmah5z1	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生44	13891385290	UNCONTACTED	\N	2026-05-22 20:18:04.793	2026-05-22 20:18:04.793	\N	四川大学	大二	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cl7002j2gl0un9h454q	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生45	13649916222	UNCONTACTED	\N	2026-05-22 20:18:04.795	2026-05-22 20:18:04.795	\N	四川师范大学	大二	计算机科学	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cl8002l2gl0bsg66yqy	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生46	13457821855	UNCONTACTED	\N	2026-05-22 20:18:04.797	2026-05-22 20:18:04.797	\N	四川大学	大三	计算机科学	INFANT	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cla002n2gl0fzxu165c	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生47	13857644299	UNCONTACTED	\N	2026-05-22 20:18:04.798	2026-05-22 20:18:04.798	\N	电子科技大学	大一	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3clc002p2gl0cr0jikfx	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生48	13429919375	UNCONTACTED	\N	2026-05-22 20:18:04.8	2026-05-22 20:18:04.8	\N	西南财经大学	大三	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cld002r2gl0pmyxn2h4	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生49	13115828547	UNCONTACTED	\N	2026-05-22 20:18:04.802	2026-05-22 20:18:04.802	\N	电子科技大学	大一	学前教育	INFANT	OTHER	MEDIUM	\N	\N
cmphd3clf002t2gl0waux5312	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生50	13359878227	UNCONTACTED	\N	2026-05-22 20:18:04.803	2026-05-22 20:18:04.803	\N	四川师范大学	大二	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3clg002v2gl0rme03mnj	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生51	13932314568	UNCONTACTED	\N	2026-05-22 20:18:04.805	2026-05-22 20:18:04.805	\N	成都理工大学	大三	英语	INFANT	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cli002x2gl0m4vg2edx	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生52	13238731886	UNCONTACTED	\N	2026-05-22 20:18:04.807	2026-05-22 20:18:04.807	\N	四川大学	大一	汉语言文学	INFANT	OTHER	MEDIUM	\N	\N
cmphd3clk002z2gl0dyxswqek	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生53	13423195604	UNCONTACTED	\N	2026-05-22 20:18:04.808	2026-05-22 20:18:04.808	\N	成都理工大学	大一	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3clm00312gl02cxh9gpi	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生54	13923211601	UNCONTACTED	\N	2026-05-22 20:18:04.81	2026-05-22 20:18:04.81	\N	电子科技大学	大三	英语	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cln00332gl0e7xtkh15	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生55	13104970931	UNCONTACTED	\N	2026-05-22 20:18:04.812	2026-05-22 20:18:04.812	\N	西南财经大学	大三	学前教育	INFANT	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3clp00352gl08zw2syp2	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生56	13587116936	UNCONTACTED	\N	2026-05-22 20:18:04.813	2026-05-22 20:18:04.813	\N	四川大学	大二	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3clr00372gl0s78t7x2i	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生57	13301615859	UNCONTACTED	\N	2026-05-22 20:18:04.815	2026-05-22 20:18:04.815	\N	四川大学	大三	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cls00392gl02gu37vm2	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生58	13525725887	UNCONTACTED	\N	2026-05-22 20:18:04.817	2026-05-22 20:18:04.817	\N	四川师范大学	大三	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3clu003b2gl0e1ubx4wz	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生59	13362616715	UNCONTACTED	\N	2026-05-22 20:18:04.818	2026-05-22 20:18:04.818	\N	西南财经大学	大一	市场营销	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3clw003d2gl0lbn1gbem	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生60	13395754150	UNCONTACTED	\N	2026-05-22 20:18:04.82	2026-05-22 20:18:04.82	\N	西南财经大学	大二	汉语言文学	INFANT	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cly003f2gl0c8ddx6y7	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生61	13297452266	UNCONTACTED	\N	2026-05-22 20:18:04.822	2026-05-22 20:18:04.822	\N	四川师范大学	大三	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3clz003h2gl0j7w1b27n	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生62	13641956945	UNCONTACTED	\N	2026-05-22 20:18:04.824	2026-05-22 20:18:04.824	\N	电子科技大学	大一	市场营销	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cm1003j2gl0idpwh6af	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生63	13989976349	UNCONTACTED	\N	2026-05-22 20:18:04.825	2026-05-22 20:18:04.825	\N	电子科技大学	大三	学前教育	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cm3003l2gl0ff5sigal	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生64	13569140656	UNCONTACTED	\N	2026-05-22 20:18:04.827	2026-05-22 20:18:04.827	\N	成都理工大学	大一	汉语言文学	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cm4003n2gl0z1j17abj	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生65	13208508083	UNCONTACTED	\N	2026-05-22 20:18:04.829	2026-05-22 20:18:04.829	\N	四川大学	大二	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cm6003p2gl06pjm2cgm	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生66	13230546490	UNCONTACTED	\N	2026-05-22 20:18:04.83	2026-05-22 20:18:04.83	\N	四川师范大学	大二	英语	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cm8003r2gl0vso1uftc	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生67	13275145116	UNCONTACTED	\N	2026-05-22 20:18:04.832	2026-05-22 20:18:04.832	\N	电子科技大学	大一	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cm9003t2gl02yqar02b	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生68	13797000553	UNCONTACTED	\N	2026-05-22 20:18:04.834	2026-05-22 20:18:04.834	\N	西南财经大学	大三	市场营销	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmb003v2gl0ksta2lwh	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生69	13708982207	UNCONTACTED	\N	2026-05-22 20:18:04.835	2026-05-22 20:18:04.835	\N	西南财经大学	大二	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmc003x2gl0wo48thy3	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生70	13325112648	UNCONTACTED	\N	2026-05-22 20:18:04.837	2026-05-22 20:18:04.837	\N	成都理工大学	大一	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cme003z2gl0sf90npel	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生71	13163570172	UNCONTACTED	\N	2026-05-22 20:18:04.838	2026-05-22 20:18:04.838	\N	电子科技大学	大一	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmg00412gl01dcxh79u	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生72	13931486239	UNCONTACTED	\N	2026-05-22 20:18:04.841	2026-05-22 20:18:04.841	\N	四川大学	大一	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmi00432gl0yekuh8bc	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生73	13892214455	UNCONTACTED	\N	2026-05-22 20:18:04.843	2026-05-22 20:18:04.843	\N	电子科技大学	大一	市场营销	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmk00452gl0f6d5w3ou	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生74	13531545905	UNCONTACTED	\N	2026-05-22 20:18:04.844	2026-05-22 20:18:04.844	\N	西南财经大学	大三	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmm00472gl09snqhywz	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生75	13330237005	UNCONTACTED	\N	2026-05-22 20:18:04.846	2026-05-22 20:18:04.846	\N	电子科技大学	大二	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmn00492gl03b91k2d1	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生76	13836253401	UNCONTACTED	\N	2026-05-22 20:18:04.848	2026-05-22 20:18:04.848	\N	电子科技大学	大一	英语	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cmp004b2gl0k53esvki	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生77	13361671381	UNCONTACTED	\N	2026-05-22 20:18:04.85	2026-05-22 20:18:04.85	\N	西南财经大学	大二	英语	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmr004d2gl0koke1dd5	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生78	13962348188	UNCONTACTED	\N	2026-05-22 20:18:04.852	2026-05-22 20:18:04.852	\N	电子科技大学	大一	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmt004f2gl07t3nzkf6	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生79	13183082199	UNCONTACTED	\N	2026-05-22 20:18:04.854	2026-05-22 20:18:04.854	\N	电子科技大学	大一	学前教育	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cmv004h2gl07df11qr9	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生80	13966047539	UNCONTACTED	\N	2026-05-22 20:18:04.855	2026-05-22 20:18:04.855	\N	西南财经大学	大二	市场营销	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmx004j2gl0zq5v9q58	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生81	13902859511	UNCONTACTED	\N	2026-05-22 20:18:04.857	2026-05-22 20:18:04.857	\N	西南财经大学	大一	英语	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cmy004l2gl07lchuayf	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生82	13888915350	UNCONTACTED	\N	2026-05-22 20:18:04.859	2026-05-22 20:18:04.859	\N	电子科技大学	大三	计算机科学	INFANT	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cn0004n2gl03id1twqb	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生83	13904889926	UNCONTACTED	\N	2026-05-22 20:18:04.86	2026-05-22 20:18:04.86	\N	成都理工大学	大二	汉语言文学	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cn2004p2gl0onngn200	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生84	13515874741	UNCONTACTED	\N	2026-05-22 20:18:04.862	2026-05-22 20:18:04.862	\N	成都理工大学	大一	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cn5004r2gl0a5b6uv4c	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生85	13607067363	UNCONTACTED	\N	2026-05-22 20:18:04.865	2026-05-22 20:18:04.865	\N	电子科技大学	大三	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cn9004t2gl06nf53iac	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生86	13395672244	UNCONTACTED	\N	2026-05-22 20:18:04.869	2026-05-22 20:18:04.869	\N	成都理工大学	大三	英语	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cna004v2gl0cbxhg9e3	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生87	13951775028	UNCONTACTED	\N	2026-05-22 20:18:04.871	2026-05-22 20:18:04.871	\N	成都理工大学	大三	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cnc004x2gl0fy0luorv	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生88	13382303163	UNCONTACTED	\N	2026-05-22 20:18:04.873	2026-05-22 20:18:04.873	\N	电子科技大学	大三	市场营销	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cne004z2gl0adxmws3s	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生89	13944886697	UNCONTACTED	\N	2026-05-22 20:18:04.874	2026-05-22 20:18:04.874	\N	成都理工大学	大二	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cng00512gl0sxiwnoyq	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生90	13296835672	UNCONTACTED	\N	2026-05-22 20:18:04.876	2026-05-22 20:18:04.876	\N	成都理工大学	大一	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cnh00532gl0bqz6ed04	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生91	13432559331	UNCONTACTED	\N	2026-05-22 20:18:04.878	2026-05-22 20:18:04.878	\N	电子科技大学	大三	计算机科学	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cnj00552gl0wsrol1sg	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生92	13490168853	UNCONTACTED	\N	2026-05-22 20:18:04.88	2026-05-22 20:18:04.88	\N	西南财经大学	大二	英语	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cnl00572gl0an0j00m4	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生93	13876873888	UNCONTACTED	\N	2026-05-22 20:18:04.881	2026-05-22 20:18:04.881	\N	成都理工大学	大一	英语	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cnn00592gl05ftwvy2s	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生94	13364733043	UNCONTACTED	\N	2026-05-22 20:18:04.884	2026-05-22 20:18:04.884	\N	电子科技大学	大二	计算机科学	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cnp005b2gl059mwooal	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生95	13314354514	UNCONTACTED	\N	2026-05-22 20:18:04.886	2026-05-22 20:18:04.886	\N	四川大学	大二	学前教育	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cnr005d2gl0q2r2ya1d	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生96	13114573397	UNCONTACTED	\N	2026-05-22 20:18:04.887	2026-05-22 20:18:04.887	\N	西南财经大学	大一	市场营销	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cnt005f2gl0cktcu4cd	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生97	13257065439	UNCONTACTED	\N	2026-05-22 20:18:04.889	2026-05-22 20:18:04.889	\N	电子科技大学	大二	汉语言文学	INFANT	OTHER	MEDIUM	\N	\N
cmphd3cnv005h2gl06ld6e3tg	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生98	13883928019	UNCONTACTED	\N	2026-05-22 20:18:04.891	2026-05-22 20:18:04.891	\N	成都理工大学	大一	汉语言文学	PRIMARY	GROUND_PROMOTION	MEDIUM	\N	\N
cmphd3cnw005j2gl0dh3qao5f	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生99	13558265311	UNCONTACTED	\N	2026-05-22 20:18:04.893	2026-05-22 20:18:04.893	\N	电子科技大学	大二	计算机科学	PRIMARY	OTHER	MEDIUM	\N	\N
cmphd3cnz005l2gl056xx17ya	cmph2tvrl0002aptpqky8hzkp	cmph2tvrp0004aptp3qiig9tq	\N	学生100	13138485843	UNCONTACTED	\N	2026-05-22 20:18:04.895	2026-05-22 20:18:04.895	\N	电子科技大学	大二	汉语言文学	PRIMARY	OTHER	MEDIUM	\N	\N
\.


--
-- Data for Name: LeadFollowUp; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LeadFollowUp" (id, "leadId", content, "nextAt", "createdAt", "creatorId", status, "intentLevel", "followAt") FROM stdin;
cmph8x3au0004hxgac1yioxf6	cmph7or6e0001qvf04ij4u7un	线索已成交，并转入学员服务系统。	\N	2026-05-22 18:21:14.358	cmph2tvrp0004aptp3qiig9tq	WON	MEDIUM	2026-05-22 18:21:14.358
\.


--
-- Data for Name: Organization; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Organization" (id, name, code, "createdAt", "updatedAt") FROM stdin;
cmph2tvrd0000aptp4f65dcn2	AI 教育科技	AIEDU	2026-05-22 15:30:46.921	2026-05-22 15:30:46.921
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Question" (id, "questionBankId", type, stem, answer, analysis, difficulty, "createdAt", "updatedAt", subject, chapter, "knowledgePoint", options, "highFrequencyTags", source, year, "paperId", "questionNo", score) FROM stdin;
cmphdfu5700011vx3vm0eg5li	\N	SINGLE_CHOICE	综合素质模拟题第1题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.42	2026-05-22 20:27:47.42	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
seed-question-002	seed-question-bank	MATERIAL_ANALYSIS	材料：某教师对学习困难学生持续鼓励并提供个别辅导。请从教师职业道德角度评析该教师行为。	该教师体现了关爱学生、教书育人等职业道德要求。	【考查范围】综合素质 / 教师职业道德 / 关爱学生\n【题型难度】材料分析，难度 3/5。\n【正确答案】该教师体现了关爱学生、教书育人等职业道德要求。\n【解析思路】本题围绕“教师职业道德、关爱学生”展开。作答时先定位题干关键词，再匹配教师资格证考试中的核心概念，排除与题意不符或表述过度的选项/论点。\n【备考提醒】建议把本题加入同知识点错题复盘，整理易混概念和答题模板。	3	2026-05-22 16:12:37.903	2026-05-22 18:34:01.785	COMPREHENSIVE_QUALITY	教师职业道德	关爱学生	\N	{教师职业道德,关爱学生}	MOCK	2026	\N	\N	\N
seed-question-001	seed-question-bank	SINGLE_CHOICE	教师在教育教学中应当把学生看作发展中的人，这体现的学生观是（ ）。	B	【考查范围】综合素质 / 职业理念 / 学生观\n【题型难度】单选，难度 2/5。\n【正确答案】B\n【解析思路】本题围绕“学生观、职业理念”展开。作答时先定位题干关键词，再匹配教师资格证考试中的核心概念，排除与题意不符或表述过度的选项/论点。\n【备考提醒】建议把本题加入同知识点错题复盘，整理易混概念和答题模板。	2	2026-05-22 16:12:37.899	2026-05-22 18:34:04.931	COMPREHENSIVE_QUALITY	职业理念	学生观	[{"key": "A", "text": "学生是完整的人"}, {"key": "B", "text": "学生是发展中的人"}, {"key": "C", "text": "学生是独特的人"}, {"key": "D", "text": "学生是被动接受者"}]	{学生观,职业理念}	REAL_EXAM	2024	\N	\N	\N
seed-question-003	\N	SHORT_ANSWER	简述激发学生学习动机的常用策略。	创设问题情境、合理设置目标、及时反馈、归因训练、增强自我效能感等。	【考查范围】教育知识与能力 / 学习心理 / 学习动机\n【题型难度】简答，难度 3/5。\n【正确答案】创设问题情境、合理设置目标、及时反馈、归因训练、增强自我效能感等。\n【解析思路】本题围绕“学习动机、教育心理学”展开。作答时先定位题干关键词，再匹配教师资格证考试中的核心概念，排除与题意不符或表述过度的选项/论点。\n【备考提醒】建议把本题加入同知识点错题复盘，整理易混概念和答题模板。	3	2026-05-22 16:12:37.905	2026-05-22 18:34:07.209	EDUCATION_KNOWLEDGE	学习心理	学习动机	\N	{学习动机,教育心理学}	ORIGINAL	2026	\N	\N	\N
cmphdfu5e00031vx3w9gg7m0i	\N	SINGLE_CHOICE	综合素质模拟题第2题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.426	2026-05-22 20:27:47.426	COMPREHENSIVE_QUALITY	第6章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5g00051vx36q6um9ic	\N	SINGLE_CHOICE	教育知识与能力模拟题第3题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.428	2026-05-22 20:27:47.428	EDUCATION_KNOWLEDGE	第2章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5h00071vx3dpl7jqhs	\N	SINGLE_CHOICE	教育知识与能力模拟题第4题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.43	2026-05-22 20:27:47.43	EDUCATION_KNOWLEDGE	第6章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5j00091vx3ze0peqa1	\N	SINGLE_CHOICE	保教知识与能力模拟题第5题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.431	2026-05-22 20:27:47.431	COMPREHENSIVE_QUALITY	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5k000b1vx3wu7x1fxu	\N	SINGLE_CHOICE	保教知识与能力模拟题第6题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.432	2026-05-22 20:27:47.432	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5l000d1vx3dsxpme58	\N	SINGLE_CHOICE	教育知识与能力模拟题第7题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.434	2026-05-22 20:27:47.434	EDUCATION_KNOWLEDGE	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5n000f1vx3y2nmo04c	\N	SINGLE_CHOICE	保教知识与能力模拟题第8题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.435	2026-05-22 20:27:47.435	COMPREHENSIVE_QUALITY	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5o000h1vx336tzygzm	\N	SINGLE_CHOICE	保教知识与能力模拟题第9题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.436	2026-05-22 20:27:47.436	COMPREHENSIVE_QUALITY	第4章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5p000j1vx3t87oi5jy	\N	SINGLE_CHOICE	综合素质模拟题第10题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.438	2026-05-22 20:27:47.438	COMPREHENSIVE_QUALITY	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5r000l1vx3r8ijt8ek	\N	SINGLE_CHOICE	教育知识与能力模拟题第11题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.439	2026-05-22 20:27:47.439	EDUCATION_KNOWLEDGE	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5t000n1vx3dn9sgpvp	\N	SINGLE_CHOICE	综合素质模拟题第12题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.441	2026-05-22 20:27:47.441	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5u000p1vx3yw5o6mq6	\N	SINGLE_CHOICE	保教知识与能力模拟题第13题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.443	2026-05-22 20:27:47.443	COMPREHENSIVE_QUALITY	第6章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5w000r1vx33c50zdtw	\N	SINGLE_CHOICE	综合素质模拟题第14题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.444	2026-05-22 20:27:47.444	COMPREHENSIVE_QUALITY	第1章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5x000t1vx3ipsiliga	\N	SINGLE_CHOICE	综合素质模拟题第15题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.445	2026-05-22 20:27:47.445	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5y000v1vx3pefx242u	\N	SINGLE_CHOICE	教育知识与能力模拟题第16题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.446	2026-05-22 20:27:47.446	EDUCATION_KNOWLEDGE	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu5z000x1vx31bnkntz5	\N	SINGLE_CHOICE	教育知识与能力模拟题第17题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.448	2026-05-22 20:27:47.448	EDUCATION_KNOWLEDGE	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu60000z1vx3tn59xgjv	\N	SINGLE_CHOICE	综合素质模拟题第18题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.449	2026-05-22 20:27:47.449	COMPREHENSIVE_QUALITY	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6300111vx3t293dzxd	\N	SINGLE_CHOICE	教育知识与能力模拟题第19题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.451	2026-05-22 20:27:47.451	EDUCATION_KNOWLEDGE	第8章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6400131vx3dva3qfy9	\N	SINGLE_CHOICE	综合素质模拟题第20题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.453	2026-05-22 20:27:47.453	COMPREHENSIVE_QUALITY	第6章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6600151vx3jxhdujdp	\N	SINGLE_CHOICE	保教知识与能力模拟题第21题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.454	2026-05-22 20:27:47.454	COMPREHENSIVE_QUALITY	第9章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6700171vx3oxkj8h1f	\N	SINGLE_CHOICE	综合素质模拟题第22题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.456	2026-05-22 20:27:47.456	COMPREHENSIVE_QUALITY	第4章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6900191vx30deqbjr1	\N	SINGLE_CHOICE	教育知识与能力模拟题第23题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.457	2026-05-22 20:27:47.457	EDUCATION_KNOWLEDGE	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6a001b1vx3tnsb3upd	\N	SINGLE_CHOICE	教育知识与能力模拟题第24题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.459	2026-05-22 20:27:47.459	EDUCATION_KNOWLEDGE	第8章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6b001d1vx33z1xr2uy	\N	SINGLE_CHOICE	综合素质模拟题第25题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.46	2026-05-22 20:27:47.46	COMPREHENSIVE_QUALITY	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6d001f1vx3tytk2p7y	\N	SINGLE_CHOICE	综合素质模拟题第26题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.461	2026-05-22 20:27:47.461	COMPREHENSIVE_QUALITY	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6e001h1vx3qv1h76aa	\N	SINGLE_CHOICE	教育知识与能力模拟题第27题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.462	2026-05-22 20:27:47.462	EDUCATION_KNOWLEDGE	第1章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6f001j1vx3pf43dyn5	\N	SINGLE_CHOICE	教育知识与能力模拟题第28题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.463	2026-05-22 20:27:47.463	EDUCATION_KNOWLEDGE	第1章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6g001l1vx3f4itbbva	\N	SINGLE_CHOICE	教育知识与能力模拟题第29题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.464	2026-05-22 20:27:47.464	EDUCATION_KNOWLEDGE	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6h001n1vx3dnpz95u8	\N	SINGLE_CHOICE	综合素质模拟题第30题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.466	2026-05-22 20:27:47.466	COMPREHENSIVE_QUALITY	第9章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6i001p1vx3tjafab62	\N	SINGLE_CHOICE	教育知识与能力模拟题第31题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.467	2026-05-22 20:27:47.467	EDUCATION_KNOWLEDGE	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6k001r1vx3epunyqxr	\N	SINGLE_CHOICE	综合素质模拟题第32题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.468	2026-05-22 20:27:47.468	COMPREHENSIVE_QUALITY	第9章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6l001t1vx3h83v16el	\N	SINGLE_CHOICE	保教知识与能力模拟题第33题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.469	2026-05-22 20:27:47.469	COMPREHENSIVE_QUALITY	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6m001v1vx33vylsws2	\N	SINGLE_CHOICE	教育知识与能力模拟题第34题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.471	2026-05-22 20:27:47.471	EDUCATION_KNOWLEDGE	第9章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6o001x1vx33w4edp5g	\N	SINGLE_CHOICE	保教知识与能力模拟题第35题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.472	2026-05-22 20:27:47.472	COMPREHENSIVE_QUALITY	第6章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6p001z1vx37t7t0ddo	\N	SINGLE_CHOICE	综合素质模拟题第36题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.474	2026-05-22 20:27:47.474	COMPREHENSIVE_QUALITY	第4章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6r00211vx3oyyfev6m	\N	SINGLE_CHOICE	综合素质模拟题第37题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.475	2026-05-22 20:27:47.475	COMPREHENSIVE_QUALITY	第1章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6s00231vx32z02nxn3	\N	SINGLE_CHOICE	综合素质模拟题第38题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.477	2026-05-22 20:27:47.477	COMPREHENSIVE_QUALITY	第9章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6u00251vx3smoopm6m	\N	SINGLE_CHOICE	保教知识与能力模拟题第39题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.478	2026-05-22 20:27:47.478	COMPREHENSIVE_QUALITY	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6v00271vx3b0fw08ab	\N	SINGLE_CHOICE	保教知识与能力模拟题第40题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.479	2026-05-22 20:27:47.479	COMPREHENSIVE_QUALITY	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6w00291vx3lmh3686h	\N	SINGLE_CHOICE	保教知识与能力模拟题第41题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.48	2026-05-22 20:27:47.48	COMPREHENSIVE_QUALITY	第5章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6x002b1vx3sggj9p1z	\N	SINGLE_CHOICE	保教知识与能力模拟题第42题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.482	2026-05-22 20:27:47.482	COMPREHENSIVE_QUALITY	第2章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu6y002d1vx3rvl4z8kk	\N	SINGLE_CHOICE	教育知识与能力模拟题第43题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.483	2026-05-22 20:27:47.483	EDUCATION_KNOWLEDGE	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu70002f1vx3hgx7rpr0	\N	SINGLE_CHOICE	教育知识与能力模拟题第44题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.484	2026-05-22 20:27:47.484	EDUCATION_KNOWLEDGE	第8章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu71002h1vx3g0ko0a4m	\N	SINGLE_CHOICE	综合素质模拟题第45题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.486	2026-05-22 20:27:47.486	COMPREHENSIVE_QUALITY	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu73002j1vx3v2rgwc3h	\N	SINGLE_CHOICE	综合素质模拟题第46题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.487	2026-05-22 20:27:47.487	COMPREHENSIVE_QUALITY	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu74002l1vx3lefowjnl	\N	SINGLE_CHOICE	综合素质模拟题第47题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.488	2026-05-22 20:27:47.488	COMPREHENSIVE_QUALITY	第9章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu76002n1vx38a5tjgnh	\N	SINGLE_CHOICE	综合素质模拟题第48题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.49	2026-05-22 20:27:47.49	COMPREHENSIVE_QUALITY	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu77002p1vx3ayv6olng	\N	SINGLE_CHOICE	教育知识与能力模拟题第49题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.492	2026-05-22 20:27:47.492	EDUCATION_KNOWLEDGE	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu79002r1vx386jxqtbj	\N	SINGLE_CHOICE	教育知识与能力模拟题第50题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.493	2026-05-22 20:27:47.493	EDUCATION_KNOWLEDGE	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7a002t1vx3ittpx3b1	\N	SINGLE_CHOICE	保教知识与能力模拟题第51题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.495	2026-05-22 20:27:47.495	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7b002v1vx3741vlev0	\N	SINGLE_CHOICE	保教知识与能力模拟题第52题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.496	2026-05-22 20:27:47.496	COMPREHENSIVE_QUALITY	第6章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7c002x1vx3n6yybqt6	\N	SINGLE_CHOICE	保教知识与能力模拟题第53题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.497	2026-05-22 20:27:47.497	COMPREHENSIVE_QUALITY	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7e002z1vx3hpusm0bn	\N	SINGLE_CHOICE	教育知识与能力模拟题第54题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.498	2026-05-22 20:27:47.498	EDUCATION_KNOWLEDGE	第4章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7f00311vx3m6wnfazh	\N	SINGLE_CHOICE	综合素质模拟题第55题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.5	2026-05-22 20:27:47.5	COMPREHENSIVE_QUALITY	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7g00331vx3bd52j07n	\N	SINGLE_CHOICE	教育知识与能力模拟题第56题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.501	2026-05-22 20:27:47.501	EDUCATION_KNOWLEDGE	第7章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7h00351vx35bjl40bx	\N	SINGLE_CHOICE	综合素质模拟题第57题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.502	2026-05-22 20:27:47.502	COMPREHENSIVE_QUALITY	第4章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7j00371vx3iohg04qf	\N	SINGLE_CHOICE	保教知识与能力模拟题第58题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.503	2026-05-22 20:27:47.503	COMPREHENSIVE_QUALITY	第6章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7k00391vx395v33xhx	\N	SINGLE_CHOICE	保教知识与能力模拟题第59题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.505	2026-05-22 20:27:47.505	COMPREHENSIVE_QUALITY	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7m003b1vx34crch34k	\N	SINGLE_CHOICE	综合素质模拟题第60题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.506	2026-05-22 20:27:47.506	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7n003d1vx3eexmxj6b	\N	SINGLE_CHOICE	综合素质模拟题第61题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.508	2026-05-22 20:27:47.508	COMPREHENSIVE_QUALITY	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7p003f1vx3qrgq446r	\N	SINGLE_CHOICE	综合素质模拟题第62题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.509	2026-05-22 20:27:47.509	COMPREHENSIVE_QUALITY	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7q003h1vx30uxdpvmu	\N	SINGLE_CHOICE	教育知识与能力模拟题第63题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.51	2026-05-22 20:27:47.51	EDUCATION_KNOWLEDGE	第8章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7r003j1vx3u6a14gn3	\N	SINGLE_CHOICE	保教知识与能力模拟题第64题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.512	2026-05-22 20:27:47.512	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7s003l1vx31hmug2i8	\N	SINGLE_CHOICE	保教知识与能力模拟题第65题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.513	2026-05-22 20:27:47.513	COMPREHENSIVE_QUALITY	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7t003n1vx3dagw9fiz	\N	SINGLE_CHOICE	保教知识与能力模拟题第66题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.514	2026-05-22 20:27:47.514	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7v003p1vx3nrwvcg99	\N	SINGLE_CHOICE	保教知识与能力模拟题第67题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.515	2026-05-22 20:27:47.515	COMPREHENSIVE_QUALITY	第1章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7w003r1vx3nj0zf6wk	\N	SINGLE_CHOICE	教育知识与能力模拟题第68题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.516	2026-05-22 20:27:47.516	EDUCATION_KNOWLEDGE	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7x003t1vx3p82se0gp	\N	SINGLE_CHOICE	保教知识与能力模拟题第69题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.518	2026-05-22 20:27:47.518	COMPREHENSIVE_QUALITY	第4章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu7y003v1vx3s8o8awfd	\N	SINGLE_CHOICE	教育知识与能力模拟题第70题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.519	2026-05-22 20:27:47.519	EDUCATION_KNOWLEDGE	第3章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu80003x1vx3jahtn8cr	\N	SINGLE_CHOICE	教育知识与能力模拟题第71题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.52	2026-05-22 20:27:47.52	EDUCATION_KNOWLEDGE	第6章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu81003z1vx3srjtaeq1	\N	SINGLE_CHOICE	教育知识与能力模拟题第72题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.522	2026-05-22 20:27:47.522	EDUCATION_KNOWLEDGE	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8400411vx3o1fzvwok	\N	SINGLE_CHOICE	综合素质模拟题第73题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.524	2026-05-22 20:27:47.524	COMPREHENSIVE_QUALITY	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8500431vx3ym9zyjx3	\N	SINGLE_CHOICE	保教知识与能力模拟题第74题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.526	2026-05-22 20:27:47.526	COMPREHENSIVE_QUALITY	第6章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8700451vx32vgrsbg5	\N	SINGLE_CHOICE	保教知识与能力模拟题第75题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.527	2026-05-22 20:27:47.527	COMPREHENSIVE_QUALITY	第8章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8800471vx3j58zpdc8	\N	SINGLE_CHOICE	教育知识与能力模拟题第76题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.529	2026-05-22 20:27:47.529	EDUCATION_KNOWLEDGE	第9章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8900491vx3ix4myhme	\N	SINGLE_CHOICE	综合素质模拟题第77题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.53	2026-05-22 20:27:47.53	COMPREHENSIVE_QUALITY	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8a004b1vx3q9320d3k	\N	SINGLE_CHOICE	综合素质模拟题第78题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.531	2026-05-22 20:27:47.531	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8c004d1vx3etboe4bk	\N	SINGLE_CHOICE	综合素质模拟题第79题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.532	2026-05-22 20:27:47.532	COMPREHENSIVE_QUALITY	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8d004f1vx3oglnss89	\N	SINGLE_CHOICE	教育知识与能力模拟题第80题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.534	2026-05-22 20:27:47.534	EDUCATION_KNOWLEDGE	第2章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8f004h1vx32k50v10a	\N	SINGLE_CHOICE	综合素质模拟题第81题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.535	2026-05-22 20:27:47.535	COMPREHENSIVE_QUALITY	第10章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8h004j1vx37oaqpvwd	\N	SINGLE_CHOICE	保教知识与能力模拟题第82题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.537	2026-05-22 20:27:47.537	COMPREHENSIVE_QUALITY	第8章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8i004l1vx3jlcu1ru6	\N	SINGLE_CHOICE	保教知识与能力模拟题第83题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.539	2026-05-22 20:27:47.539	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8k004n1vx3q689zqnc	\N	SINGLE_CHOICE	教育知识与能力模拟题第84题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.541	2026-05-22 20:27:47.541	EDUCATION_KNOWLEDGE	第4章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8m004p1vx30nmkmc1b	\N	SINGLE_CHOICE	保教知识与能力模拟题第85题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.543	2026-05-22 20:27:47.543	COMPREHENSIVE_QUALITY	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8o004r1vx385buhvhr	\N	SINGLE_CHOICE	保教知识与能力模拟题第86题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.544	2026-05-22 20:27:47.544	COMPREHENSIVE_QUALITY	第6章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8p004t1vx32w2emn4d	\N	SINGLE_CHOICE	保教知识与能力模拟题第87题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.545	2026-05-22 20:27:47.545	COMPREHENSIVE_QUALITY	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8r004v1vx3voirjf2j	\N	SINGLE_CHOICE	综合素质模拟题第88题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.547	2026-05-22 20:27:47.547	COMPREHENSIVE_QUALITY	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8t004x1vx36zb3jbez	\N	SINGLE_CHOICE	保教知识与能力模拟题第89题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.549	2026-05-22 20:27:47.549	COMPREHENSIVE_QUALITY	第6章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8u004z1vx3xz50b68c	\N	SINGLE_CHOICE	综合素质模拟题第90题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.551	2026-05-22 20:27:47.551	COMPREHENSIVE_QUALITY	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8w00511vx38h4fcjrc	\N	SINGLE_CHOICE	保教知识与能力模拟题第91题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.552	2026-05-22 20:27:47.552	COMPREHENSIVE_QUALITY	第9章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8y00531vx3v2mnewez	\N	SINGLE_CHOICE	保教知识与能力模拟题第92题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.554	2026-05-22 20:27:47.554	COMPREHENSIVE_QUALITY	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu8z00551vx315rrd4gd	\N	SINGLE_CHOICE	综合素质模拟题第93题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.556	2026-05-22 20:27:47.556	COMPREHENSIVE_QUALITY	第4章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9100571vx31q0spb3p	\N	SINGLE_CHOICE	综合素质模拟题第94题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.558	2026-05-22 20:27:47.558	COMPREHENSIVE_QUALITY	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9300591vx3rfkod9j5	\N	SINGLE_CHOICE	教育知识与能力模拟题第95题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.559	2026-05-22 20:27:47.559	EDUCATION_KNOWLEDGE	第1章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu95005b1vx3wrj4bqn0	\N	SINGLE_CHOICE	保教知识与能力模拟题第96题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.561	2026-05-22 20:27:47.561	COMPREHENSIVE_QUALITY	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu96005d1vx3km941jl0	\N	SINGLE_CHOICE	保教知识与能力模拟题第97题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.563	2026-05-22 20:27:47.563	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu98005f1vx3ihvb98oz	\N	SINGLE_CHOICE	保教知识与能力模拟题第98题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.564	2026-05-22 20:27:47.564	COMPREHENSIVE_QUALITY	第5章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu99005h1vx3tz4b0myd	\N	SINGLE_CHOICE	保教知识与能力模拟题第99题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.565	2026-05-22 20:27:47.565	COMPREHENSIVE_QUALITY	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9a005j1vx3cuby5h6b	\N	SINGLE_CHOICE	教育知识与能力模拟题第100题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.567	2026-05-22 20:27:47.567	EDUCATION_KNOWLEDGE	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9b005l1vx339mtjw9d	\N	SINGLE_CHOICE	综合素质模拟题第101题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.568	2026-05-22 20:27:47.568	COMPREHENSIVE_QUALITY	第6章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9e005n1vx3jz9tgwof	\N	SINGLE_CHOICE	综合素质模拟题第102题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.57	2026-05-22 20:27:47.57	COMPREHENSIVE_QUALITY	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9g005p1vx3rf0fq218	\N	SINGLE_CHOICE	保教知识与能力模拟题第103题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.572	2026-05-22 20:27:47.572	COMPREHENSIVE_QUALITY	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9i005r1vx3lsks1p3y	\N	SINGLE_CHOICE	教育知识与能力模拟题第104题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.574	2026-05-22 20:27:47.574	EDUCATION_KNOWLEDGE	第8章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9k005t1vx38ws0ut2i	\N	SINGLE_CHOICE	保教知识与能力模拟题第105题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.576	2026-05-22 20:27:47.576	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9m005v1vx3yuytmic2	\N	SINGLE_CHOICE	保教知识与能力模拟题第106题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.578	2026-05-22 20:27:47.578	COMPREHENSIVE_QUALITY	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9n005x1vx30kppb54m	\N	SINGLE_CHOICE	保教知识与能力模拟题第107题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.579	2026-05-22 20:27:47.579	COMPREHENSIVE_QUALITY	第1章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9p005z1vx3bn4ppdoc	\N	SINGLE_CHOICE	教育知识与能力模拟题第108题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.582	2026-05-22 20:27:47.582	EDUCATION_KNOWLEDGE	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9r00611vx3kkucrj8b	\N	SINGLE_CHOICE	综合素质模拟题第109题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.584	2026-05-22 20:27:47.584	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9t00631vx331jqqqve	\N	SINGLE_CHOICE	教育知识与能力模拟题第110题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.586	2026-05-22 20:27:47.586	EDUCATION_KNOWLEDGE	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9v00651vx3maau0ram	\N	SINGLE_CHOICE	综合素质模拟题第111题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.587	2026-05-22 20:27:47.587	COMPREHENSIVE_QUALITY	第1章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9x00671vx368njk3sg	\N	SINGLE_CHOICE	综合素质模拟题第112题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.589	2026-05-22 20:27:47.589	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfu9y00691vx39z4nyruh	\N	SINGLE_CHOICE	教育知识与能力模拟题第113题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.591	2026-05-22 20:27:47.591	EDUCATION_KNOWLEDGE	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfua0006b1vx35fkiinfa	\N	SINGLE_CHOICE	保教知识与能力模拟题第114题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.593	2026-05-22 20:27:47.593	COMPREHENSIVE_QUALITY	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfua2006d1vx3f6axy604	\N	SINGLE_CHOICE	保教知识与能力模拟题第115题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.595	2026-05-22 20:27:47.595	COMPREHENSIVE_QUALITY	第9章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfua4006f1vx3dxloghl4	\N	SINGLE_CHOICE	综合素质模拟题第116题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.596	2026-05-22 20:27:47.596	COMPREHENSIVE_QUALITY	第1章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfua5006h1vx38ltirwly	\N	SINGLE_CHOICE	保教知识与能力模拟题第117题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.597	2026-05-22 20:27:47.597	COMPREHENSIVE_QUALITY	第3章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfua7006j1vx35ewh62vr	\N	SINGLE_CHOICE	保教知识与能力模拟题第118题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.6	2026-05-22 20:27:47.6	COMPREHENSIVE_QUALITY	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfua9006l1vx32t61z96h	\N	SINGLE_CHOICE	保教知识与能力模拟题第119题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.602	2026-05-22 20:27:47.602	COMPREHENSIVE_QUALITY	第6章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuab006n1vx324mf26o8	\N	SINGLE_CHOICE	保教知识与能力模拟题第120题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.603	2026-05-22 20:27:47.603	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuad006p1vx3g2e7wlyt	\N	SINGLE_CHOICE	综合素质模拟题第121题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.606	2026-05-22 20:27:47.606	COMPREHENSIVE_QUALITY	第4章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuaf006r1vx3wn54pd7d	\N	SINGLE_CHOICE	教育知识与能力模拟题第122题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.608	2026-05-22 20:27:47.608	EDUCATION_KNOWLEDGE	第5章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuah006t1vx35gdne8f9	\N	SINGLE_CHOICE	教育知识与能力模拟题第123题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.61	2026-05-22 20:27:47.61	EDUCATION_KNOWLEDGE	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuaj006v1vx3rbv1avbk	\N	SINGLE_CHOICE	保教知识与能力模拟题第124题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.612	2026-05-22 20:27:47.612	COMPREHENSIVE_QUALITY	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfual006x1vx37gw2q7bb	\N	SINGLE_CHOICE	保教知识与能力模拟题第125题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.613	2026-05-22 20:27:47.613	COMPREHENSIVE_QUALITY	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuan006z1vx3xmk58ynb	\N	SINGLE_CHOICE	保教知识与能力模拟题第126题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.615	2026-05-22 20:27:47.615	COMPREHENSIVE_QUALITY	第4章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuao00711vx39d7ylaoe	\N	SINGLE_CHOICE	保教知识与能力模拟题第127题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.617	2026-05-22 20:27:47.617	COMPREHENSIVE_QUALITY	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuaq00731vx3wfo79hht	\N	SINGLE_CHOICE	教育知识与能力模拟题第128题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.618	2026-05-22 20:27:47.618	EDUCATION_KNOWLEDGE	第8章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuas00751vx3sy8q7d92	\N	SINGLE_CHOICE	保教知识与能力模拟题第129题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.62	2026-05-22 20:27:47.62	COMPREHENSIVE_QUALITY	第5章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuat00771vx3x9y7zfs3	\N	SINGLE_CHOICE	保教知识与能力模拟题第130题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.622	2026-05-22 20:27:47.622	COMPREHENSIVE_QUALITY	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuav00791vx3whnwco9r	\N	SINGLE_CHOICE	教育知识与能力模拟题第131题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.623	2026-05-22 20:27:47.623	EDUCATION_KNOWLEDGE	第8章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuax007b1vx37kvcihuo	\N	SINGLE_CHOICE	教育知识与能力模拟题第132题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.625	2026-05-22 20:27:47.625	EDUCATION_KNOWLEDGE	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuaz007d1vx37oux8bj3	\N	SINGLE_CHOICE	保教知识与能力模拟题第133题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.627	2026-05-22 20:27:47.627	COMPREHENSIVE_QUALITY	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfub0007f1vx39tm5189n	\N	SINGLE_CHOICE	教育知识与能力模拟题第134题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.629	2026-05-22 20:27:47.629	EDUCATION_KNOWLEDGE	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfub2007h1vx3n2x5jj5i	\N	SINGLE_CHOICE	教育知识与能力模拟题第135题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.63	2026-05-22 20:27:47.63	EDUCATION_KNOWLEDGE	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfub3007j1vx3n2ko18hl	\N	SINGLE_CHOICE	教育知识与能力模拟题第136题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.631	2026-05-22 20:27:47.631	EDUCATION_KNOWLEDGE	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfub4007l1vx38xo04llt	\N	SINGLE_CHOICE	综合素质模拟题第137题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.633	2026-05-22 20:27:47.633	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfub6007n1vx3udep8df0	\N	SINGLE_CHOICE	综合素质模拟题第138题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.634	2026-05-22 20:27:47.634	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfub7007p1vx3rqah7wsf	\N	SINGLE_CHOICE	保教知识与能力模拟题第139题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.636	2026-05-22 20:27:47.636	COMPREHENSIVE_QUALITY	第2章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfub9007r1vx3whhu42oa	\N	SINGLE_CHOICE	教育知识与能力模拟题第140题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.637	2026-05-22 20:27:47.637	EDUCATION_KNOWLEDGE	第7章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubb007t1vx3g2uoz4t0	\N	SINGLE_CHOICE	保教知识与能力模拟题第141题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.639	2026-05-22 20:27:47.639	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubc007v1vx3siq8ro0r	\N	SINGLE_CHOICE	教育知识与能力模拟题第142题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.641	2026-05-22 20:27:47.641	EDUCATION_KNOWLEDGE	第9章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfube007x1vx35yfil94u	\N	SINGLE_CHOICE	综合素质模拟题第143题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.642	2026-05-22 20:27:47.642	COMPREHENSIVE_QUALITY	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubg007z1vx3t4njwl2t	\N	SINGLE_CHOICE	教育知识与能力模拟题第144题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.644	2026-05-22 20:27:47.644	EDUCATION_KNOWLEDGE	第6章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubh00811vx3t4japb2w	\N	SINGLE_CHOICE	教育知识与能力模拟题第145题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.645	2026-05-22 20:27:47.645	EDUCATION_KNOWLEDGE	第9章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubi00831vx3067mx47w	\N	SINGLE_CHOICE	保教知识与能力模拟题第146题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.647	2026-05-22 20:27:47.647	COMPREHENSIVE_QUALITY	第1章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubk00851vx3gf13l8cy	\N	SINGLE_CHOICE	综合素质模拟题第147题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.648	2026-05-22 20:27:47.648	COMPREHENSIVE_QUALITY	第7章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubl00871vx3ft5th3nr	\N	SINGLE_CHOICE	保教知识与能力模拟题第148题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.649	2026-05-22 20:27:47.649	COMPREHENSIVE_QUALITY	第1章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubm00891vx3zwnm2maj	\N	SINGLE_CHOICE	教育知识与能力模拟题第149题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.651	2026-05-22 20:27:47.651	EDUCATION_KNOWLEDGE	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubo008b1vx3xp6nnbbb	\N	SINGLE_CHOICE	综合素质模拟题第150题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.652	2026-05-22 20:27:47.652	COMPREHENSIVE_QUALITY	第1章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubq008d1vx3u3b1lvq7	\N	SINGLE_CHOICE	教育知识与能力模拟题第151题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.655	2026-05-22 20:27:47.655	EDUCATION_KNOWLEDGE	第5章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubs008f1vx3chnxzmt7	\N	SINGLE_CHOICE	保教知识与能力模拟题第152题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.657	2026-05-22 20:27:47.657	COMPREHENSIVE_QUALITY	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubv008h1vx3cypxa5as	\N	SINGLE_CHOICE	教育知识与能力模拟题第153题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.659	2026-05-22 20:27:47.659	EDUCATION_KNOWLEDGE	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubx008j1vx3zenq46j9	\N	SINGLE_CHOICE	教育知识与能力模拟题第154题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.662	2026-05-22 20:27:47.662	EDUCATION_KNOWLEDGE	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfubz008l1vx35a5vsy01	\N	SINGLE_CHOICE	综合素质模拟题第155题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.664	2026-05-22 20:27:47.664	COMPREHENSIVE_QUALITY	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuc1008n1vx3x6vwmxy8	\N	SINGLE_CHOICE	综合素质模拟题第156题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.665	2026-05-22 20:27:47.665	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuc3008p1vx3vkfbr4t7	\N	SINGLE_CHOICE	保教知识与能力模拟题第157题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.667	2026-05-22 20:27:47.667	COMPREHENSIVE_QUALITY	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuc4008r1vx33uv46suj	\N	SINGLE_CHOICE	保教知识与能力模拟题第158题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.669	2026-05-22 20:27:47.669	COMPREHENSIVE_QUALITY	第8章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuc7008t1vx3wc524ybl	\N	SINGLE_CHOICE	保教知识与能力模拟题第159题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.671	2026-05-22 20:27:47.671	COMPREHENSIVE_QUALITY	第7章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuc8008v1vx3yw0bh5c2	\N	SINGLE_CHOICE	综合素质模拟题第160题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.673	2026-05-22 20:27:47.673	COMPREHENSIVE_QUALITY	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuca008x1vx348ilw3p0	\N	SINGLE_CHOICE	综合素质模拟题第161题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.675	2026-05-22 20:27:47.675	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfucc008z1vx3wlg6tjv0	\N	SINGLE_CHOICE	综合素质模拟题第162题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.677	2026-05-22 20:27:47.677	COMPREHENSIVE_QUALITY	第2章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuce00911vx33y40q54h	\N	SINGLE_CHOICE	综合素质模拟题第163题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.679	2026-05-22 20:27:47.679	COMPREHENSIVE_QUALITY	第6章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfucg00931vx31wfnvw4r	\N	SINGLE_CHOICE	保教知识与能力模拟题第164题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.68	2026-05-22 20:27:47.68	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuci00951vx3vouyfy2j	\N	SINGLE_CHOICE	综合素质模拟题第165题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.682	2026-05-22 20:27:47.682	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfucj00971vx3yeckefv4	\N	SINGLE_CHOICE	综合素质模拟题第166题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.684	2026-05-22 20:27:47.684	COMPREHENSIVE_QUALITY	第6章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfucl00991vx3syt0jqb3	\N	SINGLE_CHOICE	教育知识与能力模拟题第167题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.686	2026-05-22 20:27:47.686	EDUCATION_KNOWLEDGE	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuco009b1vx3ateqhta2	\N	SINGLE_CHOICE	教育知识与能力模拟题第168题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.689	2026-05-22 20:27:47.689	EDUCATION_KNOWLEDGE	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfucq009d1vx3woc8sycc	\N	SINGLE_CHOICE	保教知识与能力模拟题第169题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.691	2026-05-22 20:27:47.691	COMPREHENSIVE_QUALITY	第8章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfucs009f1vx3foq4eyqm	\N	SINGLE_CHOICE	综合素质模拟题第170题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.692	2026-05-22 20:27:47.692	COMPREHENSIVE_QUALITY	第4章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfucu009h1vx3yg11tl8s	\N	SINGLE_CHOICE	综合素质模拟题第171题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.694	2026-05-22 20:27:47.694	COMPREHENSIVE_QUALITY	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfucw009j1vx3ht7rx65z	\N	SINGLE_CHOICE	保教知识与能力模拟题第172题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.696	2026-05-22 20:27:47.696	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfucy009l1vx3wr7k17qa	\N	SINGLE_CHOICE	教育知识与能力模拟题第173题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.698	2026-05-22 20:27:47.698	EDUCATION_KNOWLEDGE	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfud0009n1vx3butt14te	\N	SINGLE_CHOICE	保教知识与能力模拟题第174题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.7	2026-05-22 20:27:47.7	COMPREHENSIVE_QUALITY	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfud2009p1vx3ftr62irk	\N	SINGLE_CHOICE	综合素质模拟题第175题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.702	2026-05-22 20:27:47.702	COMPREHENSIVE_QUALITY	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfud4009r1vx3rukhkto4	\N	SINGLE_CHOICE	教育知识与能力模拟题第176题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.704	2026-05-22 20:27:47.704	EDUCATION_KNOWLEDGE	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfud6009t1vx3g8kxb0kg	\N	SINGLE_CHOICE	教育知识与能力模拟题第177题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.706	2026-05-22 20:27:47.706	EDUCATION_KNOWLEDGE	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfud8009v1vx3s9q57a81	\N	SINGLE_CHOICE	保教知识与能力模拟题第178题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.708	2026-05-22 20:27:47.708	COMPREHENSIVE_QUALITY	第5章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuda009x1vx3b2ww7mta	\N	SINGLE_CHOICE	教育知识与能力模拟题第179题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.71	2026-05-22 20:27:47.71	EDUCATION_KNOWLEDGE	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfudc009z1vx3gyabtlch	\N	SINGLE_CHOICE	教育知识与能力模拟题第180题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.712	2026-05-22 20:27:47.712	EDUCATION_KNOWLEDGE	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfude00a11vx35ugd5tmd	\N	SINGLE_CHOICE	综合素质模拟题第181题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.714	2026-05-22 20:27:47.714	COMPREHENSIVE_QUALITY	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfudh00a31vx352hf1rji	\N	SINGLE_CHOICE	综合素质模拟题第182题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.717	2026-05-22 20:27:47.717	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfudj00a51vx3wwlvrcn1	\N	SINGLE_CHOICE	教育知识与能力模拟题第183题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.719	2026-05-22 20:27:47.719	EDUCATION_KNOWLEDGE	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfudn00a71vx3lx4m29ow	\N	SINGLE_CHOICE	综合素质模拟题第184题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.723	2026-05-22 20:27:47.723	COMPREHENSIVE_QUALITY	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfudp00a91vx3ad1d1s03	\N	SINGLE_CHOICE	综合素质模拟题第185题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.726	2026-05-22 20:27:47.726	COMPREHENSIVE_QUALITY	第4章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfudr00ab1vx3bee7g2wj	\N	SINGLE_CHOICE	教育知识与能力模拟题第186题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.728	2026-05-22 20:27:47.728	EDUCATION_KNOWLEDGE	第1章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfudt00ad1vx3gyl9h466	\N	SINGLE_CHOICE	保教知识与能力模拟题第187题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.729	2026-05-22 20:27:47.729	COMPREHENSIVE_QUALITY	第3章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfudw00af1vx3p7epl3x4	\N	SINGLE_CHOICE	保教知识与能力模拟题第188题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.732	2026-05-22 20:27:47.732	COMPREHENSIVE_QUALITY	第4章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfudx00ah1vx3h1lxminx	\N	SINGLE_CHOICE	保教知识与能力模拟题第189题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.734	2026-05-22 20:27:47.734	COMPREHENSIVE_QUALITY	第5章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfudz00aj1vx3bxphkfy4	\N	SINGLE_CHOICE	综合素质模拟题第190题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.735	2026-05-22 20:27:47.735	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfue100al1vx38l8rtjzc	\N	SINGLE_CHOICE	教育知识与能力模拟题第191题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.737	2026-05-22 20:27:47.737	EDUCATION_KNOWLEDGE	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfue200an1vx3pv7pluhq	\N	SINGLE_CHOICE	教育知识与能力模拟题第192题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.739	2026-05-22 20:27:47.739	EDUCATION_KNOWLEDGE	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfue400ap1vx3r27vwb79	\N	SINGLE_CHOICE	综合素质模拟题第193题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.741	2026-05-22 20:27:47.741	COMPREHENSIVE_QUALITY	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfue800ar1vx3v7ph3n6s	\N	SINGLE_CHOICE	综合素质模拟题第194题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.744	2026-05-22 20:27:47.744	COMPREHENSIVE_QUALITY	第10章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuea00at1vx38mjba8m1	\N	SINGLE_CHOICE	综合素质模拟题第195题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.746	2026-05-22 20:27:47.746	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfueb00av1vx3lvjt3xb1	\N	SINGLE_CHOICE	保教知识与能力模拟题第196题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.748	2026-05-22 20:27:47.748	COMPREHENSIVE_QUALITY	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfued00ax1vx3m9x6mbtq	\N	SINGLE_CHOICE	保教知识与能力模拟题第197题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.75	2026-05-22 20:27:47.75	COMPREHENSIVE_QUALITY	第2章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuef00az1vx3afifp0kn	\N	SINGLE_CHOICE	教育知识与能力模拟题第198题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.752	2026-05-22 20:27:47.752	EDUCATION_KNOWLEDGE	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfueh00b11vx3s2otsc21	\N	SINGLE_CHOICE	综合素质模拟题第199题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.753	2026-05-22 20:27:47.753	COMPREHENSIVE_QUALITY	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuej00b31vx3fuhllm83	\N	SINGLE_CHOICE	综合素质模拟题第200题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.755	2026-05-22 20:27:47.755	COMPREHENSIVE_QUALITY	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuem00b51vx3l27ly5ow	\N	SINGLE_CHOICE	保教知识与能力模拟题第201题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.758	2026-05-22 20:27:47.758	COMPREHENSIVE_QUALITY	第9章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfueo00b71vx3ita7hnso	\N	SINGLE_CHOICE	综合素质模拟题第202题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.761	2026-05-22 20:27:47.761	COMPREHENSIVE_QUALITY	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfueq00b91vx36kpmcou1	\N	SINGLE_CHOICE	综合素质模拟题第203题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.763	2026-05-22 20:27:47.763	COMPREHENSIVE_QUALITY	第2章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuet00bb1vx38hgf65fl	\N	SINGLE_CHOICE	保教知识与能力模拟题第204题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.765	2026-05-22 20:27:47.765	COMPREHENSIVE_QUALITY	第1章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuev00bd1vx3xx34cn4y	\N	SINGLE_CHOICE	保教知识与能力模拟题第205题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.768	2026-05-22 20:27:47.768	COMPREHENSIVE_QUALITY	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuex00bf1vx3prwnmetr	\N	SINGLE_CHOICE	综合素质模拟题第206题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.77	2026-05-22 20:27:47.77	COMPREHENSIVE_QUALITY	第5章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuez00bh1vx3aq6dbg4r	\N	SINGLE_CHOICE	综合素质模拟题第207题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.772	2026-05-22 20:27:47.772	COMPREHENSIVE_QUALITY	第1章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuf200bj1vx3tivotq2w	\N	SINGLE_CHOICE	教育知识与能力模拟题第208题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.774	2026-05-22 20:27:47.774	EDUCATION_KNOWLEDGE	第2章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuf500bl1vx324u0tjzy	\N	SINGLE_CHOICE	教育知识与能力模拟题第209题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.777	2026-05-22 20:27:47.777	EDUCATION_KNOWLEDGE	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuf700bn1vx3q9mgkcza	\N	SINGLE_CHOICE	保教知识与能力模拟题第210题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.779	2026-05-22 20:27:47.779	COMPREHENSIVE_QUALITY	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuf900bp1vx3m6jv8k86	\N	SINGLE_CHOICE	教育知识与能力模拟题第211题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.781	2026-05-22 20:27:47.781	EDUCATION_KNOWLEDGE	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfufb00br1vx3pcmy9qtm	\N	SINGLE_CHOICE	保教知识与能力模拟题第212题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.783	2026-05-22 20:27:47.783	COMPREHENSIVE_QUALITY	第2章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfufd00bt1vx315zkvqvn	\N	SINGLE_CHOICE	保教知识与能力模拟题第213题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.786	2026-05-22 20:27:47.786	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuff00bv1vx3ux9yacr6	\N	SINGLE_CHOICE	保教知识与能力模拟题第214题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.788	2026-05-22 20:27:47.788	COMPREHENSIVE_QUALITY	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfufi00bx1vx33iqdzzev	\N	SINGLE_CHOICE	综合素质模拟题第215题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.79	2026-05-22 20:27:47.79	COMPREHENSIVE_QUALITY	第7章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfufk00bz1vx33mow5vqv	\N	SINGLE_CHOICE	综合素质模拟题第216题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.792	2026-05-22 20:27:47.792	COMPREHENSIVE_QUALITY	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfufm00c11vx31a2pedbk	\N	SINGLE_CHOICE	综合素质模拟题第217题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.794	2026-05-22 20:27:47.794	COMPREHENSIVE_QUALITY	第9章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfufo00c31vx3ttybxplh	\N	SINGLE_CHOICE	综合素质模拟题第218题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.796	2026-05-22 20:27:47.796	COMPREHENSIVE_QUALITY	第6章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfufq00c51vx38wkg4y11	\N	SINGLE_CHOICE	保教知识与能力模拟题第219题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.798	2026-05-22 20:27:47.798	COMPREHENSIVE_QUALITY	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuft00c71vx3534ty4h1	\N	SINGLE_CHOICE	保教知识与能力模拟题第220题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.801	2026-05-22 20:27:47.801	COMPREHENSIVE_QUALITY	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfufv00c91vx3ctuzcfue	\N	SINGLE_CHOICE	综合素质模拟题第221题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.804	2026-05-22 20:27:47.804	COMPREHENSIVE_QUALITY	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfufy00cb1vx303f9j10b	\N	SINGLE_CHOICE	教育知识与能力模拟题第222题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.807	2026-05-22 20:27:47.807	EDUCATION_KNOWLEDGE	第6章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfug100cd1vx3ezie0exz	\N	SINGLE_CHOICE	保教知识与能力模拟题第223题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.809	2026-05-22 20:27:47.809	COMPREHENSIVE_QUALITY	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfug400cf1vx3igdvup2s	\N	SINGLE_CHOICE	综合素质模拟题第224题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.812	2026-05-22 20:27:47.812	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfug700ch1vx3gs239gyr	\N	SINGLE_CHOICE	教育知识与能力模拟题第225题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.815	2026-05-22 20:27:47.815	EDUCATION_KNOWLEDGE	第3章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfug900cj1vx31rsezj4d	\N	SINGLE_CHOICE	教育知识与能力模拟题第226题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.818	2026-05-22 20:27:47.818	EDUCATION_KNOWLEDGE	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfugc00cl1vx38z79bmvt	\N	SINGLE_CHOICE	教育知识与能力模拟题第227题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.82	2026-05-22 20:27:47.82	EDUCATION_KNOWLEDGE	第7章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuge00cn1vx38abnjil7	\N	SINGLE_CHOICE	教育知识与能力模拟题第228题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.823	2026-05-22 20:27:47.823	EDUCATION_KNOWLEDGE	第4章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfugh00cp1vx3vvl5d4jf	\N	SINGLE_CHOICE	教育知识与能力模拟题第229题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.825	2026-05-22 20:27:47.825	EDUCATION_KNOWLEDGE	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfugj00cr1vx3zcgu72oi	\N	SINGLE_CHOICE	综合素质模拟题第230题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.827	2026-05-22 20:27:47.827	COMPREHENSIVE_QUALITY	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfugm00ct1vx3epcr1kya	\N	SINGLE_CHOICE	保教知识与能力模拟题第231题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.83	2026-05-22 20:27:47.83	COMPREHENSIVE_QUALITY	第6章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfugo00cv1vx3yxnpaos6	\N	SINGLE_CHOICE	保教知识与能力模拟题第232题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.833	2026-05-22 20:27:47.833	COMPREHENSIVE_QUALITY	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfugr00cx1vx3r80iqtsm	\N	SINGLE_CHOICE	保教知识与能力模拟题第233题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.835	2026-05-22 20:27:47.835	COMPREHENSIVE_QUALITY	第4章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfugt00cz1vx3a4b660px	\N	SINGLE_CHOICE	综合素质模拟题第234题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.838	2026-05-22 20:27:47.838	COMPREHENSIVE_QUALITY	第1章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfugw00d11vx3zdeteorq	\N	SINGLE_CHOICE	综合素质模拟题第235题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.84	2026-05-22 20:27:47.84	COMPREHENSIVE_QUALITY	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfugz00d31vx3gawaw1bo	\N	SINGLE_CHOICE	保教知识与能力模拟题第236题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.844	2026-05-22 20:27:47.844	COMPREHENSIVE_QUALITY	第8章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuh200d51vx3t3xmm5zj	\N	SINGLE_CHOICE	保教知识与能力模拟题第237题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.846	2026-05-22 20:27:47.846	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuh500d71vx3ysbgdhvn	\N	SINGLE_CHOICE	综合素质模拟题第238题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.849	2026-05-22 20:27:47.849	COMPREHENSIVE_QUALITY	第8章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuh800d91vx3fm4vrgen	\N	SINGLE_CHOICE	保教知识与能力模拟题第239题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.852	2026-05-22 20:27:47.852	COMPREHENSIVE_QUALITY	第1章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuhb00db1vx3ir2qrtt7	\N	SINGLE_CHOICE	保教知识与能力模拟题第240题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.855	2026-05-22 20:27:47.855	COMPREHENSIVE_QUALITY	第10章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuhd00dd1vx38h59ay57	\N	SINGLE_CHOICE	保教知识与能力模拟题第241题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.858	2026-05-22 20:27:47.858	COMPREHENSIVE_QUALITY	第3章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuhg00df1vx322er1zh8	\N	SINGLE_CHOICE	保教知识与能力模拟题第242题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.86	2026-05-22 20:27:47.86	COMPREHENSIVE_QUALITY	第8章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuhj00dh1vx34815kn2j	\N	SINGLE_CHOICE	保教知识与能力模拟题第243题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.864	2026-05-22 20:27:47.864	COMPREHENSIVE_QUALITY	第9章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuhn00dj1vx3v9rskaip	\N	SINGLE_CHOICE	综合素质模拟题第244题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.867	2026-05-22 20:27:47.867	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuhr00dl1vx309l8y5sl	\N	SINGLE_CHOICE	综合素质模拟题第245题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.871	2026-05-22 20:27:47.871	COMPREHENSIVE_QUALITY	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuhu00dn1vx37hcl5zod	\N	SINGLE_CHOICE	综合素质模拟题第246题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.874	2026-05-22 20:27:47.874	COMPREHENSIVE_QUALITY	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuhx00dp1vx36qjtkm9n	\N	SINGLE_CHOICE	综合素质模拟题第247题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.877	2026-05-22 20:27:47.877	COMPREHENSIVE_QUALITY	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfui100dr1vx3wijq50vn	\N	SINGLE_CHOICE	综合素质模拟题第248题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.881	2026-05-22 20:27:47.881	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfui400dt1vx3qkewvenq	\N	SINGLE_CHOICE	教育知识与能力模拟题第249题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.884	2026-05-22 20:27:47.884	EDUCATION_KNOWLEDGE	第9章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfui700dv1vx3yk9xpqbx	\N	SINGLE_CHOICE	教育知识与能力模拟题第250题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.888	2026-05-22 20:27:47.888	EDUCATION_KNOWLEDGE	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuib00dx1vx3e5bin3d2	\N	SINGLE_CHOICE	教育知识与能力模拟题第251题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.891	2026-05-22 20:27:47.891	EDUCATION_KNOWLEDGE	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuie00dz1vx36ejy9z35	\N	SINGLE_CHOICE	保教知识与能力模拟题第252题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.895	2026-05-22 20:27:47.895	COMPREHENSIVE_QUALITY	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuii00e11vx3ka66u1lk	\N	SINGLE_CHOICE	综合素质模拟题第253题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.898	2026-05-22 20:27:47.898	COMPREHENSIVE_QUALITY	第6章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuil00e31vx3rmzzmhdc	\N	SINGLE_CHOICE	教育知识与能力模拟题第254题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.902	2026-05-22 20:27:47.902	EDUCATION_KNOWLEDGE	第4章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuio00e51vx3zrg14weq	\N	SINGLE_CHOICE	教育知识与能力模拟题第255题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.905	2026-05-22 20:27:47.905	EDUCATION_KNOWLEDGE	第8章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuir00e71vx3ws0gr2eg	\N	SINGLE_CHOICE	教育知识与能力模拟题第256题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.908	2026-05-22 20:27:47.908	EDUCATION_KNOWLEDGE	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuiv00e91vx3okvmph5s	\N	SINGLE_CHOICE	教育知识与能力模拟题第257题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.911	2026-05-22 20:27:47.911	EDUCATION_KNOWLEDGE	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuiy00eb1vx3ctb1ly6m	\N	SINGLE_CHOICE	教育知识与能力模拟题第258题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.915	2026-05-22 20:27:47.915	EDUCATION_KNOWLEDGE	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuj200ed1vx3ry5vcg56	\N	SINGLE_CHOICE	综合素质模拟题第259题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.918	2026-05-22 20:27:47.918	COMPREHENSIVE_QUALITY	第7章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuj600ef1vx3hephqfjh	\N	SINGLE_CHOICE	综合素质模拟题第260题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.923	2026-05-22 20:27:47.923	COMPREHENSIVE_QUALITY	第2章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfujb00eh1vx33aobgqgo	\N	SINGLE_CHOICE	综合素质模拟题第261题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.928	2026-05-22 20:27:47.928	COMPREHENSIVE_QUALITY	第5章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfujg00ej1vx32po6injj	\N	SINGLE_CHOICE	保教知识与能力模拟题第262题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.932	2026-05-22 20:27:47.932	COMPREHENSIVE_QUALITY	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfujj00el1vx3xbd97o7i	\N	SINGLE_CHOICE	保教知识与能力模拟题第263题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.935	2026-05-22 20:27:47.935	COMPREHENSIVE_QUALITY	第2章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfujm00en1vx3xxumh5n1	\N	SINGLE_CHOICE	综合素质模拟题第264题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.938	2026-05-22 20:27:47.938	COMPREHENSIVE_QUALITY	第9章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfujp00ep1vx37prtwyyr	\N	SINGLE_CHOICE	教育知识与能力模拟题第265题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.941	2026-05-22 20:27:47.941	EDUCATION_KNOWLEDGE	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfujs00er1vx3ftb1bjs1	\N	SINGLE_CHOICE	保教知识与能力模拟题第266题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.944	2026-05-22 20:27:47.944	COMPREHENSIVE_QUALITY	第8章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfujv00et1vx3szwiu7kg	\N	SINGLE_CHOICE	教育知识与能力模拟题第267题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.948	2026-05-22 20:27:47.948	EDUCATION_KNOWLEDGE	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfujy00ev1vx3rcb6jx15	\N	SINGLE_CHOICE	保教知识与能力模拟题第268题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.951	2026-05-22 20:27:47.951	COMPREHENSIVE_QUALITY	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuk100ex1vx3ppxuwroj	\N	SINGLE_CHOICE	综合素质模拟题第269题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.953	2026-05-22 20:27:47.953	COMPREHENSIVE_QUALITY	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuk400ez1vx33vu0n28l	\N	SINGLE_CHOICE	教育知识与能力模拟题第270题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.957	2026-05-22 20:27:47.957	EDUCATION_KNOWLEDGE	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuk800f11vx35vsaaxj5	\N	SINGLE_CHOICE	综合素质模拟题第271题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.961	2026-05-22 20:27:47.961	COMPREHENSIVE_QUALITY	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfukc00f31vx38ytc20bw	\N	SINGLE_CHOICE	综合素质模拟题第272题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.964	2026-05-22 20:27:47.964	COMPREHENSIVE_QUALITY	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfukg00f51vx33gw31dhz	\N	SINGLE_CHOICE	教育知识与能力模拟题第273题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.968	2026-05-22 20:27:47.968	EDUCATION_KNOWLEDGE	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfukl00f71vx3helg6cli	\N	SINGLE_CHOICE	教育知识与能力模拟题第274题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.973	2026-05-22 20:27:47.973	EDUCATION_KNOWLEDGE	第2章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfukp00f91vx3z1vxmusj	\N	SINGLE_CHOICE	保教知识与能力模拟题第275题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.977	2026-05-22 20:27:47.977	COMPREHENSIVE_QUALITY	第9章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfukt00fb1vx3sv4y7cc3	\N	SINGLE_CHOICE	保教知识与能力模拟题第276题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.981	2026-05-22 20:27:47.981	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfukw00fd1vx36o5jxref	\N	SINGLE_CHOICE	综合素质模拟题第277题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.984	2026-05-22 20:27:47.984	COMPREHENSIVE_QUALITY	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfukz00ff1vx3tbjqbb6g	\N	SINGLE_CHOICE	综合素质模拟题第278题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.987	2026-05-22 20:27:47.987	COMPREHENSIVE_QUALITY	第9章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdful200fh1vx3en3a2l3a	\N	SINGLE_CHOICE	教育知识与能力模拟题第279题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.99	2026-05-22 20:27:47.99	EDUCATION_KNOWLEDGE	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdful700fj1vx3atbjqbxn	\N	SINGLE_CHOICE	综合素质模拟题第280题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:47.996	2026-05-22 20:27:47.996	COMPREHENSIVE_QUALITY	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfulc00fl1vx3mydtse21	\N	SINGLE_CHOICE	保教知识与能力模拟题第281题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48	2026-05-22 20:27:48	COMPREHENSIVE_QUALITY	第8章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfulf00fn1vx3u3vew8yd	\N	SINGLE_CHOICE	保教知识与能力模拟题第282题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.003	2026-05-22 20:27:48.003	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuli00fp1vx351rrtwn1	\N	SINGLE_CHOICE	综合素质模拟题第283题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.006	2026-05-22 20:27:48.006	COMPREHENSIVE_QUALITY	第8章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfulo00fr1vx3av0n5oi9	\N	SINGLE_CHOICE	综合素质模拟题第284题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.012	2026-05-22 20:27:48.012	COMPREHENSIVE_QUALITY	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfult00ft1vx3j5rq8dxw	\N	SINGLE_CHOICE	综合素质模拟题第285题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.017	2026-05-22 20:27:48.017	COMPREHENSIVE_QUALITY	第7章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfulw00fv1vx3vbgkpd0k	\N	SINGLE_CHOICE	综合素质模拟题第286题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.02	2026-05-22 20:27:48.02	COMPREHENSIVE_QUALITY	第3章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfulz00fx1vx30tkb3exz	\N	SINGLE_CHOICE	综合素质模拟题第287题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.023	2026-05-22 20:27:48.023	COMPREHENSIVE_QUALITY	第3章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfum200fz1vx3jpouhm6d	\N	SINGLE_CHOICE	保教知识与能力模拟题第288题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.026	2026-05-22 20:27:48.026	COMPREHENSIVE_QUALITY	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfum700g11vx3ygsrfu20	\N	SINGLE_CHOICE	综合素质模拟题第289题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.031	2026-05-22 20:27:48.031	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfum900g31vx3vnoznq10	\N	SINGLE_CHOICE	保教知识与能力模拟题第290题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.034	2026-05-22 20:27:48.034	COMPREHENSIVE_QUALITY	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfumc00g51vx3iw1t9xay	\N	SINGLE_CHOICE	教育知识与能力模拟题第291题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.036	2026-05-22 20:27:48.036	EDUCATION_KNOWLEDGE	第3章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfume00g71vx3bt7i9lwk	\N	SINGLE_CHOICE	保教知识与能力模拟题第292题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.039	2026-05-22 20:27:48.039	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfumh00g91vx3mqs1hrem	\N	SINGLE_CHOICE	保教知识与能力模拟题第293题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.041	2026-05-22 20:27:48.041	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuml00gb1vx3nrn085e1	\N	SINGLE_CHOICE	教育知识与能力模拟题第294题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.046	2026-05-22 20:27:48.046	EDUCATION_KNOWLEDGE	第8章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfump00gd1vx3er473ml2	\N	SINGLE_CHOICE	综合素质模拟题第295题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.049	2026-05-22 20:27:48.049	COMPREHENSIVE_QUALITY	第2章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfumr00gf1vx3dwvda3vk	\N	SINGLE_CHOICE	教育知识与能力模拟题第296题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.051	2026-05-22 20:27:48.051	EDUCATION_KNOWLEDGE	第2章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfumu00gh1vx3yn0zz8do	\N	SINGLE_CHOICE	保教知识与能力模拟题第297题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.054	2026-05-22 20:27:48.054	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfumw00gj1vx35oioy5tu	\N	SINGLE_CHOICE	保教知识与能力模拟题第298题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.057	2026-05-22 20:27:48.057	COMPREHENSIVE_QUALITY	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfumz00gl1vx3t6vrgvy8	\N	SINGLE_CHOICE	教育知识与能力模拟题第299题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.06	2026-05-22 20:27:48.06	EDUCATION_KNOWLEDGE	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfun500gn1vx3wq6uuqw7	\N	SINGLE_CHOICE	教育知识与能力模拟题第300题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.065	2026-05-22 20:27:48.065	EDUCATION_KNOWLEDGE	第10章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfun700gp1vx3oq7xmr5s	\N	SINGLE_CHOICE	教育知识与能力模拟题第301题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.068	2026-05-22 20:27:48.068	EDUCATION_KNOWLEDGE	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuna00gr1vx3n4pve7sj	\N	SINGLE_CHOICE	教育知识与能力模拟题第302题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.07	2026-05-22 20:27:48.07	EDUCATION_KNOWLEDGE	第5章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfund00gt1vx3jumypvak	\N	SINGLE_CHOICE	保教知识与能力模拟题第303题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.073	2026-05-22 20:27:48.073	COMPREHENSIVE_QUALITY	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfung00gv1vx3udl5al7o	\N	SINGLE_CHOICE	保教知识与能力模拟题第304题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.076	2026-05-22 20:27:48.076	COMPREHENSIVE_QUALITY	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfunm00gx1vx30e8ng4ac	\N	SINGLE_CHOICE	综合素质模拟题第305题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.083	2026-05-22 20:27:48.083	COMPREHENSIVE_QUALITY	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfunr00gz1vx39jfy04ei	\N	SINGLE_CHOICE	教育知识与能力模拟题第306题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.088	2026-05-22 20:27:48.088	EDUCATION_KNOWLEDGE	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfunv00h11vx3yyg4moy5	\N	SINGLE_CHOICE	保教知识与能力模拟题第307题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.091	2026-05-22 20:27:48.091	COMPREHENSIVE_QUALITY	第2章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuo100h31vx3ffbx2rnp	\N	SINGLE_CHOICE	教育知识与能力模拟题第308题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.097	2026-05-22 20:27:48.097	EDUCATION_KNOWLEDGE	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuo500h51vx33wahwx3g	\N	SINGLE_CHOICE	保教知识与能力模拟题第309题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.101	2026-05-22 20:27:48.101	COMPREHENSIVE_QUALITY	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuo800h71vx3c7ayny5n	\N	SINGLE_CHOICE	保教知识与能力模拟题第310题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.104	2026-05-22 20:27:48.104	COMPREHENSIVE_QUALITY	第4章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuob00h91vx3ck1806li	\N	SINGLE_CHOICE	保教知识与能力模拟题第311题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.107	2026-05-22 20:27:48.107	COMPREHENSIVE_QUALITY	第5章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuoh00hb1vx3dy7jbuqz	\N	SINGLE_CHOICE	综合素质模拟题第312题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.114	2026-05-22 20:27:48.114	COMPREHENSIVE_QUALITY	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuol00hd1vx3td1zysxx	\N	SINGLE_CHOICE	综合素质模拟题第313题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.118	2026-05-22 20:27:48.118	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuop00hf1vx3od2pxmky	\N	SINGLE_CHOICE	综合素质模拟题第314题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.121	2026-05-22 20:27:48.121	COMPREHENSIVE_QUALITY	第2章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuos00hh1vx33aiduslj	\N	SINGLE_CHOICE	教育知识与能力模拟题第315题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.124	2026-05-22 20:27:48.124	EDUCATION_KNOWLEDGE	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuow00hj1vx3td4bboa0	\N	SINGLE_CHOICE	综合素质模拟题第316题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.128	2026-05-22 20:27:48.128	COMPREHENSIVE_QUALITY	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfup000hl1vx339bdyp8y	\N	SINGLE_CHOICE	保教知识与能力模拟题第317题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.132	2026-05-22 20:27:48.132	COMPREHENSIVE_QUALITY	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfup300hn1vx3org279gg	\N	SINGLE_CHOICE	教育知识与能力模拟题第318题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.135	2026-05-22 20:27:48.135	EDUCATION_KNOWLEDGE	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfup600hp1vx3n9y8dl3y	\N	SINGLE_CHOICE	教育知识与能力模拟题第319题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.138	2026-05-22 20:27:48.138	EDUCATION_KNOWLEDGE	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfup900hr1vx3rouxkkf8	\N	SINGLE_CHOICE	保教知识与能力模拟题第320题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.141	2026-05-22 20:27:48.141	COMPREHENSIVE_QUALITY	第2章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfupc00ht1vx3m2mw8uvx	\N	SINGLE_CHOICE	教育知识与能力模拟题第321题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.144	2026-05-22 20:27:48.144	EDUCATION_KNOWLEDGE	第6章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfupi00hv1vx3ouw6hmc7	\N	SINGLE_CHOICE	保教知识与能力模拟题第322题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.151	2026-05-22 20:27:48.151	COMPREHENSIVE_QUALITY	第3章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfupm00hx1vx3440vchuj	\N	SINGLE_CHOICE	综合素质模拟题第323题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.154	2026-05-22 20:27:48.154	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfupp00hz1vx3mshl8bdi	\N	SINGLE_CHOICE	保教知识与能力模拟题第324题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.157	2026-05-22 20:27:48.157	COMPREHENSIVE_QUALITY	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfups00i11vx37uccsdx7	\N	SINGLE_CHOICE	教育知识与能力模拟题第325题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.16	2026-05-22 20:27:48.16	EDUCATION_KNOWLEDGE	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfupv00i31vx3xmpmbn8x	\N	SINGLE_CHOICE	保教知识与能力模拟题第326题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.163	2026-05-22 20:27:48.163	COMPREHENSIVE_QUALITY	第9章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfupz00i51vx3odoyh51a	\N	SINGLE_CHOICE	教育知识与能力模拟题第327题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.167	2026-05-22 20:27:48.167	EDUCATION_KNOWLEDGE	第5章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuq200i71vx3fk26oxzi	\N	SINGLE_CHOICE	保教知识与能力模拟题第328题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.17	2026-05-22 20:27:48.17	COMPREHENSIVE_QUALITY	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuq500i91vx3mrvhk3s9	\N	SINGLE_CHOICE	综合素质模拟题第329题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.173	2026-05-22 20:27:48.173	COMPREHENSIVE_QUALITY	第6章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuq800ib1vx3priy5337	\N	SINGLE_CHOICE	综合素质模拟题第330题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.176	2026-05-22 20:27:48.176	COMPREHENSIVE_QUALITY	第8章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuqc00id1vx30ui22l64	\N	SINGLE_CHOICE	教育知识与能力模拟题第331题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.18	2026-05-22 20:27:48.18	EDUCATION_KNOWLEDGE	第10章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuqg00if1vx3w1zxqbgy	\N	SINGLE_CHOICE	综合素质模拟题第332题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.185	2026-05-22 20:27:48.185	COMPREHENSIVE_QUALITY	第6章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuqj00ih1vx3zq2i5fdy	\N	SINGLE_CHOICE	保教知识与能力模拟题第333题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.188	2026-05-22 20:27:48.188	COMPREHENSIVE_QUALITY	第4章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuqm00ij1vx3zuty25cw	\N	SINGLE_CHOICE	综合素质模拟题第334题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.19	2026-05-22 20:27:48.19	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuqo00il1vx322bbuxj3	\N	SINGLE_CHOICE	保教知识与能力模拟题第335题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.193	2026-05-22 20:27:48.193	COMPREHENSIVE_QUALITY	第1章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuqr00in1vx3zkhyi3mg	\N	SINGLE_CHOICE	综合素质模拟题第336题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.195	2026-05-22 20:27:48.195	COMPREHENSIVE_QUALITY	第6章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuqu00ip1vx31dwvm5e6	\N	SINGLE_CHOICE	保教知识与能力模拟题第337题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.198	2026-05-22 20:27:48.198	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuqw00ir1vx3kzh55gk2	\N	SINGLE_CHOICE	综合素质模拟题第338题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.201	2026-05-22 20:27:48.201	COMPREHENSIVE_QUALITY	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuqz00it1vx3tap22ed1	\N	SINGLE_CHOICE	保教知识与能力模拟题第339题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.203	2026-05-22 20:27:48.203	COMPREHENSIVE_QUALITY	第5章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfur100iv1vx3aznwjgnj	\N	SINGLE_CHOICE	综合素质模拟题第340题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.205	2026-05-22 20:27:48.205	COMPREHENSIVE_QUALITY	第2章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfur300ix1vx3h6da559f	\N	SINGLE_CHOICE	保教知识与能力模拟题第341题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.207	2026-05-22 20:27:48.207	COMPREHENSIVE_QUALITY	第7章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfur500iz1vx3povqi9qs	\N	SINGLE_CHOICE	保教知识与能力模拟题第342题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.21	2026-05-22 20:27:48.21	COMPREHENSIVE_QUALITY	第5章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfur700j11vx3735p1xwv	\N	SINGLE_CHOICE	保教知识与能力模拟题第343题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.212	2026-05-22 20:27:48.212	COMPREHENSIVE_QUALITY	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfurb00j31vx33uvsiumx	\N	SINGLE_CHOICE	保教知识与能力模拟题第344题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.215	2026-05-22 20:27:48.215	COMPREHENSIVE_QUALITY	第1章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfurd00j51vx3fk375kyq	\N	SINGLE_CHOICE	教育知识与能力模拟题第345题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.217	2026-05-22 20:27:48.217	EDUCATION_KNOWLEDGE	第3章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfurf00j71vx3pahzyy12	\N	SINGLE_CHOICE	教育知识与能力模拟题第346题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.219	2026-05-22 20:27:48.219	EDUCATION_KNOWLEDGE	第1章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfurh00j91vx3fyaft2qc	\N	SINGLE_CHOICE	综合素质模拟题第347题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.222	2026-05-22 20:27:48.222	COMPREHENSIVE_QUALITY	第6章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfurk00jb1vx3fgaqnjux	\N	SINGLE_CHOICE	教育知识与能力模拟题第348题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.224	2026-05-22 20:27:48.224	EDUCATION_KNOWLEDGE	第2章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfurm00jd1vx3fl2ccuuz	\N	SINGLE_CHOICE	保教知识与能力模拟题第349题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.226	2026-05-22 20:27:48.226	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfurp00jf1vx38cswmp2w	\N	SINGLE_CHOICE	综合素质模拟题第350题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.23	2026-05-22 20:27:48.23	COMPREHENSIVE_QUALITY	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfurr00jh1vx382xvtg6n	\N	SINGLE_CHOICE	综合素质模拟题第351题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.232	2026-05-22 20:27:48.232	COMPREHENSIVE_QUALITY	第6章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuru00jj1vx3s7gtdawi	\N	SINGLE_CHOICE	综合素质模拟题第352题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.234	2026-05-22 20:27:48.234	COMPREHENSIVE_QUALITY	第8章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfurx00jl1vx3sbh7r23w	\N	SINGLE_CHOICE	综合素质模拟题第353题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.237	2026-05-22 20:27:48.237	COMPREHENSIVE_QUALITY	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfus000jn1vx3swdgo7jr	\N	SINGLE_CHOICE	综合素质模拟题第354题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.24	2026-05-22 20:27:48.24	COMPREHENSIVE_QUALITY	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfus200jp1vx38i4oagwp	\N	SINGLE_CHOICE	综合素质模拟题第355题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.242	2026-05-22 20:27:48.242	COMPREHENSIVE_QUALITY	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfus400jr1vx3fc0ceji7	\N	SINGLE_CHOICE	教育知识与能力模拟题第356题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.245	2026-05-22 20:27:48.245	EDUCATION_KNOWLEDGE	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfus700jt1vx3asc9fn66	\N	SINGLE_CHOICE	综合素质模拟题第357题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.247	2026-05-22 20:27:48.247	COMPREHENSIVE_QUALITY	第1章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfus900jv1vx3uucxxp5b	\N	SINGLE_CHOICE	保教知识与能力模拟题第358题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.249	2026-05-22 20:27:48.249	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfusb00jx1vx3f3q3wjn0	\N	SINGLE_CHOICE	教育知识与能力模拟题第359题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.252	2026-05-22 20:27:48.252	EDUCATION_KNOWLEDGE	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuse00jz1vx3i9bid0gx	\N	SINGLE_CHOICE	教育知识与能力模拟题第360题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.255	2026-05-22 20:27:48.255	EDUCATION_KNOWLEDGE	第6章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfusg00k11vx3hlb95jmy	\N	SINGLE_CHOICE	综合素质模拟题第361题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.257	2026-05-22 20:27:48.257	COMPREHENSIVE_QUALITY	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfusi00k31vx3et2az8tm	\N	SINGLE_CHOICE	保教知识与能力模拟题第362题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.259	2026-05-22 20:27:48.259	COMPREHENSIVE_QUALITY	第7章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfusl00k51vx3uu6k1da4	\N	SINGLE_CHOICE	综合素质模拟题第363题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.261	2026-05-22 20:27:48.261	COMPREHENSIVE_QUALITY	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfusn00k71vx3gcxzdcyp	\N	SINGLE_CHOICE	综合素质模拟题第364题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.263	2026-05-22 20:27:48.263	COMPREHENSIVE_QUALITY	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfusp00k91vx3qw42xqmi	\N	SINGLE_CHOICE	综合素质模拟题第365题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.265	2026-05-22 20:27:48.265	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuss00kb1vx3w19htsv7	\N	SINGLE_CHOICE	综合素质模拟题第366题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.268	2026-05-22 20:27:48.268	COMPREHENSIVE_QUALITY	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfusu00kd1vx3m7tq7xwd	\N	SINGLE_CHOICE	教育知识与能力模拟题第367题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.271	2026-05-22 20:27:48.271	EDUCATION_KNOWLEDGE	第4章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfusx00kf1vx32xl2mhse	\N	SINGLE_CHOICE	保教知识与能力模拟题第368题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.273	2026-05-22 20:27:48.273	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfusz00kh1vx3nt2dj5al	\N	SINGLE_CHOICE	保教知识与能力模拟题第369题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.276	2026-05-22 20:27:48.276	COMPREHENSIVE_QUALITY	第4章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfut200kj1vx3pjj9bz04	\N	SINGLE_CHOICE	综合素质模拟题第370题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.279	2026-05-22 20:27:48.279	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfut500kl1vx3v0kidex0	\N	SINGLE_CHOICE	综合素质模拟题第371题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.282	2026-05-22 20:27:48.282	COMPREHENSIVE_QUALITY	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfut800kn1vx3cnfc75s8	\N	SINGLE_CHOICE	教育知识与能力模拟题第372题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.284	2026-05-22 20:27:48.284	EDUCATION_KNOWLEDGE	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfutb00kp1vx3kxbplbm9	\N	SINGLE_CHOICE	教育知识与能力模拟题第373题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.287	2026-05-22 20:27:48.287	EDUCATION_KNOWLEDGE	第2章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfutd00kr1vx3jztsy58h	\N	SINGLE_CHOICE	教育知识与能力模拟题第374题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.29	2026-05-22 20:27:48.29	EDUCATION_KNOWLEDGE	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfutg00kt1vx3l3bgix23	\N	SINGLE_CHOICE	教育知识与能力模拟题第375题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.292	2026-05-22 20:27:48.292	EDUCATION_KNOWLEDGE	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfutj00kv1vx3q9phqhp6	\N	SINGLE_CHOICE	保教知识与能力模拟题第376题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.295	2026-05-22 20:27:48.295	COMPREHENSIVE_QUALITY	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfutm00kx1vx3zfiedjm8	\N	SINGLE_CHOICE	教育知识与能力模拟题第377题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.298	2026-05-22 20:27:48.298	EDUCATION_KNOWLEDGE	第1章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuto00kz1vx3gapwuhgs	\N	SINGLE_CHOICE	教育知识与能力模拟题第378题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.301	2026-05-22 20:27:48.301	EDUCATION_KNOWLEDGE	第10章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfutr00l11vx36nhwwkvo	\N	SINGLE_CHOICE	教育知识与能力模拟题第379题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.304	2026-05-22 20:27:48.304	EDUCATION_KNOWLEDGE	第2章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfutu00l31vx3ky2jhyv7	\N	SINGLE_CHOICE	综合素质模拟题第380题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.307	2026-05-22 20:27:48.307	COMPREHENSIVE_QUALITY	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfutx00l51vx3q4l3zxi7	\N	SINGLE_CHOICE	保教知识与能力模拟题第381题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.31	2026-05-22 20:27:48.31	COMPREHENSIVE_QUALITY	第2章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuu100l71vx3ow00vb30	\N	SINGLE_CHOICE	综合素质模拟题第382题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.313	2026-05-22 20:27:48.313	COMPREHENSIVE_QUALITY	第5章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuu500l91vx3mdm8mpl1	\N	SINGLE_CHOICE	综合素质模拟题第383题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.317	2026-05-22 20:27:48.317	COMPREHENSIVE_QUALITY	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuu700lb1vx31lint7zz	\N	SINGLE_CHOICE	保教知识与能力模拟题第384题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.32	2026-05-22 20:27:48.32	COMPREHENSIVE_QUALITY	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuua00ld1vx3mx8vissu	\N	SINGLE_CHOICE	教育知识与能力模拟题第385题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.322	2026-05-22 20:27:48.322	EDUCATION_KNOWLEDGE	第1章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuud00lf1vx3rg0u7vkt	\N	SINGLE_CHOICE	综合素质模拟题第386题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.325	2026-05-22 20:27:48.325	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuug00lh1vx3puw30q2p	\N	SINGLE_CHOICE	综合素质模拟题第387题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.328	2026-05-22 20:27:48.328	COMPREHENSIVE_QUALITY	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuui00lj1vx3gwhgnpe4	\N	SINGLE_CHOICE	综合素质模拟题第388题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.331	2026-05-22 20:27:48.331	COMPREHENSIVE_QUALITY	第3章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuul00ll1vx3djsws8s2	\N	SINGLE_CHOICE	教育知识与能力模拟题第389题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.334	2026-05-22 20:27:48.334	EDUCATION_KNOWLEDGE	第9章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuuo00ln1vx3sd1tzy1s	\N	SINGLE_CHOICE	教育知识与能力模拟题第390题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.336	2026-05-22 20:27:48.336	EDUCATION_KNOWLEDGE	第4章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuur00lp1vx3ofdyywzz	\N	SINGLE_CHOICE	综合素质模拟题第391题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.34	2026-05-22 20:27:48.34	COMPREHENSIVE_QUALITY	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuuu00lr1vx3k8nfvj2v	\N	SINGLE_CHOICE	教育知识与能力模拟题第392题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.343	2026-05-22 20:27:48.343	EDUCATION_KNOWLEDGE	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuuy00lt1vx3gpx31zgz	\N	SINGLE_CHOICE	保教知识与能力模拟题第393题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.346	2026-05-22 20:27:48.346	COMPREHENSIVE_QUALITY	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuv100lv1vx36zyb2tkn	\N	SINGLE_CHOICE	教育知识与能力模拟题第394题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.349	2026-05-22 20:27:48.349	EDUCATION_KNOWLEDGE	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuv400lx1vx33674sdg5	\N	SINGLE_CHOICE	教育知识与能力模拟题第395题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.352	2026-05-22 20:27:48.352	EDUCATION_KNOWLEDGE	第8章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuv700lz1vx3q4b6qsaa	\N	SINGLE_CHOICE	综合素质模拟题第396题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.355	2026-05-22 20:27:48.355	COMPREHENSIVE_QUALITY	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuv900m11vx3lhgxg2vf	\N	SINGLE_CHOICE	保教知识与能力模拟题第397题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.358	2026-05-22 20:27:48.358	COMPREHENSIVE_QUALITY	第9章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvb00m31vx3pixf5gek	\N	SINGLE_CHOICE	保教知识与能力模拟题第398题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.359	2026-05-22 20:27:48.359	COMPREHENSIVE_QUALITY	第1章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvd00m51vx3sks7wooz	\N	SINGLE_CHOICE	综合素质模拟题第399题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.361	2026-05-22 20:27:48.361	COMPREHENSIVE_QUALITY	第6章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvf00m71vx35ljsghx9	\N	SINGLE_CHOICE	教育知识与能力模拟题第400题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.364	2026-05-22 20:27:48.364	EDUCATION_KNOWLEDGE	第4章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvh00m91vx38y0ddx54	\N	SINGLE_CHOICE	综合素质模拟题第401题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.366	2026-05-22 20:27:48.366	COMPREHENSIVE_QUALITY	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvk00mb1vx32svx1ma9	\N	SINGLE_CHOICE	综合素质模拟题第402题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.368	2026-05-22 20:27:48.368	COMPREHENSIVE_QUALITY	第1章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvm00md1vx31zu4hawq	\N	SINGLE_CHOICE	保教知识与能力模拟题第403题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.371	2026-05-22 20:27:48.371	COMPREHENSIVE_QUALITY	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvq00mf1vx39im5h674	\N	SINGLE_CHOICE	保教知识与能力模拟题第404题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.374	2026-05-22 20:27:48.374	COMPREHENSIVE_QUALITY	第3章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvt00mh1vx303uk5un3	\N	SINGLE_CHOICE	综合素质模拟题第405题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.377	2026-05-22 20:27:48.377	COMPREHENSIVE_QUALITY	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvv00mj1vx3xg6v39mm	\N	SINGLE_CHOICE	保教知识与能力模拟题第406题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.379	2026-05-22 20:27:48.379	COMPREHENSIVE_QUALITY	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvx00ml1vx3r0gwbi21	\N	SINGLE_CHOICE	综合素质模拟题第407题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.381	2026-05-22 20:27:48.381	COMPREHENSIVE_QUALITY	第4章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuvz00mn1vx3rckn1qjz	\N	SINGLE_CHOICE	教育知识与能力模拟题第408题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.384	2026-05-22 20:27:48.384	EDUCATION_KNOWLEDGE	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuw200mp1vx3sp391gej	\N	SINGLE_CHOICE	保教知识与能力模拟题第409题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.387	2026-05-22 20:27:48.387	COMPREHENSIVE_QUALITY	第8章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuw500mr1vx3ffeswrki	\N	SINGLE_CHOICE	教育知识与能力模拟题第410题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.389	2026-05-22 20:27:48.389	EDUCATION_KNOWLEDGE	第3章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuw700mt1vx3svnwdrti	\N	SINGLE_CHOICE	保教知识与能力模拟题第411题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.391	2026-05-22 20:27:48.391	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuw900mv1vx3c8w18sfz	\N	SINGLE_CHOICE	保教知识与能力模拟题第412题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.394	2026-05-22 20:27:48.394	COMPREHENSIVE_QUALITY	第3章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuwc00mx1vx331fmw2rz	\N	SINGLE_CHOICE	教育知识与能力模拟题第413题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.396	2026-05-22 20:27:48.396	EDUCATION_KNOWLEDGE	第3章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuwe00mz1vx3linlqave	\N	SINGLE_CHOICE	保教知识与能力模拟题第414题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.398	2026-05-22 20:27:48.398	COMPREHENSIVE_QUALITY	第3章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuwh00n11vx39ktzjao1	\N	SINGLE_CHOICE	综合素质模拟题第415题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.401	2026-05-22 20:27:48.401	COMPREHENSIVE_QUALITY	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuwj00n31vx3l0033dz3	\N	SINGLE_CHOICE	教育知识与能力模拟题第416题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.404	2026-05-22 20:27:48.404	EDUCATION_KNOWLEDGE	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuwm00n51vx3odcwdii9	\N	SINGLE_CHOICE	保教知识与能力模拟题第417题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.406	2026-05-22 20:27:48.406	COMPREHENSIVE_QUALITY	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuwp00n71vx3dz4p58re	\N	SINGLE_CHOICE	教育知识与能力模拟题第418题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.409	2026-05-22 20:27:48.409	EDUCATION_KNOWLEDGE	第6章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuwr00n91vx3ur1atfx3	\N	SINGLE_CHOICE	综合素质模拟题第419题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.412	2026-05-22 20:27:48.412	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuwt00nb1vx303pc9reh	\N	SINGLE_CHOICE	保教知识与能力模拟题第420题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.414	2026-05-22 20:27:48.414	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuwv00nd1vx370klq172	\N	SINGLE_CHOICE	保教知识与能力模拟题第421题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.416	2026-05-22 20:27:48.416	COMPREHENSIVE_QUALITY	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuwy00nf1vx3vk0g2r3u	\N	SINGLE_CHOICE	教育知识与能力模拟题第422题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.418	2026-05-22 20:27:48.418	EDUCATION_KNOWLEDGE	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfux000nh1vx3qpi9npsz	\N	SINGLE_CHOICE	综合素质模拟题第423题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.42	2026-05-22 20:27:48.42	COMPREHENSIVE_QUALITY	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfux200nj1vx3zwee0wb0	\N	SINGLE_CHOICE	综合素质模拟题第424题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.422	2026-05-22 20:27:48.422	COMPREHENSIVE_QUALITY	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfux500nl1vx3kdtjdn74	\N	SINGLE_CHOICE	保教知识与能力模拟题第425题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.425	2026-05-22 20:27:48.425	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfux700nn1vx39csozyhz	\N	SINGLE_CHOICE	保教知识与能力模拟题第426题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.428	2026-05-22 20:27:48.428	COMPREHENSIVE_QUALITY	第6章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxa00np1vx355bsovgu	\N	SINGLE_CHOICE	综合素质模拟题第427题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.43	2026-05-22 20:27:48.43	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxd00nr1vx3r1bba6h5	\N	SINGLE_CHOICE	保教知识与能力模拟题第428题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.433	2026-05-22 20:27:48.433	COMPREHENSIVE_QUALITY	第3章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxf00nt1vx3a89gb748	\N	SINGLE_CHOICE	保教知识与能力模拟题第429题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.435	2026-05-22 20:27:48.435	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxh00nv1vx3id7ekkym	\N	SINGLE_CHOICE	教育知识与能力模拟题第430题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.437	2026-05-22 20:27:48.437	EDUCATION_KNOWLEDGE	第5章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxj00nx1vx31gdjecg0	\N	SINGLE_CHOICE	保教知识与能力模拟题第431题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.439	2026-05-22 20:27:48.439	COMPREHENSIVE_QUALITY	第2章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxl00nz1vx3x53hdiy6	\N	SINGLE_CHOICE	综合素质模拟题第432题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.441	2026-05-22 20:27:48.441	COMPREHENSIVE_QUALITY	第10章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxn00o11vx3hag2aq25	\N	SINGLE_CHOICE	教育知识与能力模拟题第433题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.443	2026-05-22 20:27:48.443	EDUCATION_KNOWLEDGE	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxp00o31vx3bikcow3m	\N	SINGLE_CHOICE	教育知识与能力模拟题第434题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.445	2026-05-22 20:27:48.445	EDUCATION_KNOWLEDGE	第10章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxs00o51vx346524hgf	\N	SINGLE_CHOICE	综合素质模拟题第435题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.448	2026-05-22 20:27:48.448	COMPREHENSIVE_QUALITY	第3章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxu00o71vx3sltqeciy	\N	SINGLE_CHOICE	综合素质模拟题第436题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.45	2026-05-22 20:27:48.45	COMPREHENSIVE_QUALITY	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxw00o91vx3otix22t8	\N	SINGLE_CHOICE	保教知识与能力模拟题第437题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.452	2026-05-22 20:27:48.452	COMPREHENSIVE_QUALITY	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuxy00ob1vx36bd2p0iu	\N	SINGLE_CHOICE	综合素质模拟题第438题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.454	2026-05-22 20:27:48.454	COMPREHENSIVE_QUALITY	第7章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuy000od1vx3pf3nijnd	\N	SINGLE_CHOICE	教育知识与能力模拟题第439题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.456	2026-05-22 20:27:48.456	EDUCATION_KNOWLEDGE	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuy200of1vx3osmjofis	\N	SINGLE_CHOICE	保教知识与能力模拟题第440题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.458	2026-05-22 20:27:48.458	COMPREHENSIVE_QUALITY	第9章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuy400oh1vx3d9v9c2vh	\N	SINGLE_CHOICE	综合素质模拟题第441题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.461	2026-05-22 20:27:48.461	COMPREHENSIVE_QUALITY	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuy600oj1vx3j3pnpjyl	\N	SINGLE_CHOICE	综合素质模拟题第442题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.463	2026-05-22 20:27:48.463	COMPREHENSIVE_QUALITY	第7章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuy900ol1vx3cbb624by	\N	SINGLE_CHOICE	综合素质模拟题第443题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.465	2026-05-22 20:27:48.465	COMPREHENSIVE_QUALITY	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyb00on1vx3u9jkqzpj	\N	SINGLE_CHOICE	教育知识与能力模拟题第444题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.467	2026-05-22 20:27:48.467	EDUCATION_KNOWLEDGE	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyd00op1vx3wo4xgg8r	\N	SINGLE_CHOICE	综合素质模拟题第445题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.47	2026-05-22 20:27:48.47	COMPREHENSIVE_QUALITY	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyh00or1vx3n2cpmxnb	\N	SINGLE_CHOICE	教育知识与能力模拟题第446题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.473	2026-05-22 20:27:48.473	EDUCATION_KNOWLEDGE	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyi00ot1vx384s3726z	\N	SINGLE_CHOICE	综合素质模拟题第447题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.475	2026-05-22 20:27:48.475	COMPREHENSIVE_QUALITY	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyk00ov1vx3ex8m8gnh	\N	SINGLE_CHOICE	保教知识与能力模拟题第448题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.477	2026-05-22 20:27:48.477	COMPREHENSIVE_QUALITY	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyn00ox1vx3hd6d06tr	\N	SINGLE_CHOICE	保教知识与能力模拟题第449题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.479	2026-05-22 20:27:48.479	COMPREHENSIVE_QUALITY	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyp00oz1vx388t9m31m	\N	SINGLE_CHOICE	保教知识与能力模拟题第450题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.481	2026-05-22 20:27:48.481	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyr00p11vx3w2vcu0ws	\N	SINGLE_CHOICE	教育知识与能力模拟题第451题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.483	2026-05-22 20:27:48.483	EDUCATION_KNOWLEDGE	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyt00p31vx33v5b0zl5	\N	SINGLE_CHOICE	保教知识与能力模拟题第452题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.485	2026-05-22 20:27:48.485	COMPREHENSIVE_QUALITY	第5章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyv00p51vx3d827yjyw	\N	SINGLE_CHOICE	保教知识与能力模拟题第453题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.488	2026-05-22 20:27:48.488	COMPREHENSIVE_QUALITY	第7章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuyy00p71vx3cevj2iku	\N	SINGLE_CHOICE	教育知识与能力模拟题第454题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.49	2026-05-22 20:27:48.49	EDUCATION_KNOWLEDGE	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuz100p91vx3cfm42ezh	\N	SINGLE_CHOICE	保教知识与能力模拟题第455题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.493	2026-05-22 20:27:48.493	COMPREHENSIVE_QUALITY	第9章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuz300pb1vx3lcfi5das	\N	SINGLE_CHOICE	保教知识与能力模拟题第456题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.495	2026-05-22 20:27:48.495	COMPREHENSIVE_QUALITY	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuz600pd1vx3p08g7d3o	\N	SINGLE_CHOICE	保教知识与能力模拟题第457题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.498	2026-05-22 20:27:48.498	COMPREHENSIVE_QUALITY	第7章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuz900pf1vx3yh2xis4t	\N	SINGLE_CHOICE	综合素质模拟题第458题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.501	2026-05-22 20:27:48.501	COMPREHENSIVE_QUALITY	第1章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuzb00ph1vx3cionrf4p	\N	SINGLE_CHOICE	综合素质模拟题第459题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.503	2026-05-22 20:27:48.503	COMPREHENSIVE_QUALITY	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuze00pj1vx35xglgh68	\N	SINGLE_CHOICE	综合素质模拟题第460题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.506	2026-05-22 20:27:48.506	COMPREHENSIVE_QUALITY	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuzg00pl1vx3vq38auxy	\N	SINGLE_CHOICE	保教知识与能力模拟题第461题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.508	2026-05-22 20:27:48.508	COMPREHENSIVE_QUALITY	第1章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuzj00pn1vx38gqn4e19	\N	SINGLE_CHOICE	综合素质模拟题第462题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.511	2026-05-22 20:27:48.511	COMPREHENSIVE_QUALITY	第6章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuzm00pp1vx3in8azdtr	\N	SINGLE_CHOICE	保教知识与能力模拟题第463题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.514	2026-05-22 20:27:48.514	COMPREHENSIVE_QUALITY	第7章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuzo00pr1vx30jo9ejvq	\N	SINGLE_CHOICE	综合素质模拟题第464题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.516	2026-05-22 20:27:48.516	COMPREHENSIVE_QUALITY	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuzq00pt1vx39fqhicqw	\N	SINGLE_CHOICE	综合素质模拟题第465题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.519	2026-05-22 20:27:48.519	COMPREHENSIVE_QUALITY	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuzs00pv1vx34qwwm06w	\N	SINGLE_CHOICE	保教知识与能力模拟题第466题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.52	2026-05-22 20:27:48.52	COMPREHENSIVE_QUALITY	第5章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuzv00px1vx3lq6gscns	\N	SINGLE_CHOICE	综合素质模拟题第467题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.523	2026-05-22 20:27:48.523	COMPREHENSIVE_QUALITY	第10章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfuzy00pz1vx3jzseluek	\N	SINGLE_CHOICE	教育知识与能力模拟题第468题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.526	2026-05-22 20:27:48.526	EDUCATION_KNOWLEDGE	第8章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0000q11vx3o01uk6rj	\N	SINGLE_CHOICE	保教知识与能力模拟题第469题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.529	2026-05-22 20:27:48.529	COMPREHENSIVE_QUALITY	第1章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0300q31vx3i63wfhij	\N	SINGLE_CHOICE	教育知识与能力模拟题第470题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.531	2026-05-22 20:27:48.531	EDUCATION_KNOWLEDGE	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0400q51vx3rn6hkcif	\N	SINGLE_CHOICE	教育知识与能力模拟题第471题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.533	2026-05-22 20:27:48.533	EDUCATION_KNOWLEDGE	第7章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0700q71vx3yfledyti	\N	SINGLE_CHOICE	综合素质模拟题第472题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.535	2026-05-22 20:27:48.535	COMPREHENSIVE_QUALITY	第7章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0900q91vx3ey4n17qa	\N	SINGLE_CHOICE	保教知识与能力模拟题第473题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.538	2026-05-22 20:27:48.538	COMPREHENSIVE_QUALITY	第4章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0b00qb1vx3qf5bptdu	\N	SINGLE_CHOICE	保教知识与能力模拟题第474题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.54	2026-05-22 20:27:48.54	COMPREHENSIVE_QUALITY	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0d00qd1vx3f20czrjx	\N	SINGLE_CHOICE	保教知识与能力模拟题第475题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.542	2026-05-22 20:27:48.542	COMPREHENSIVE_QUALITY	第10章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0g00qf1vx34p2cmozt	\N	SINGLE_CHOICE	综合素质模拟题第476题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.544	2026-05-22 20:27:48.544	COMPREHENSIVE_QUALITY	第4章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0h00qh1vx3v0yzc3aq	\N	SINGLE_CHOICE	保教知识与能力模拟题第477题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.546	2026-05-22 20:27:48.546	COMPREHENSIVE_QUALITY	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0j00qj1vx3pnkbgwzf	\N	SINGLE_CHOICE	综合素质模拟题第478题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.548	2026-05-22 20:27:48.548	COMPREHENSIVE_QUALITY	第8章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0m00ql1vx35fhad9k7	\N	SINGLE_CHOICE	教育知识与能力模拟题第479题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.55	2026-05-22 20:27:48.55	EDUCATION_KNOWLEDGE	第3章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0o00qn1vx34bc6q0kz	\N	SINGLE_CHOICE	教育知识与能力模拟题第480题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.553	2026-05-22 20:27:48.553	EDUCATION_KNOWLEDGE	第3章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0r00qp1vx3u3l4i6ob	\N	SINGLE_CHOICE	教育知识与能力模拟题第481题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.556	2026-05-22 20:27:48.556	EDUCATION_KNOWLEDGE	第1章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0u00qr1vx39m81u23x	\N	SINGLE_CHOICE	教育知识与能力模拟题第482题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.558	2026-05-22 20:27:48.558	EDUCATION_KNOWLEDGE	第2章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv0x00qt1vx38ux1auis	\N	SINGLE_CHOICE	保教知识与能力模拟题第483题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.561	2026-05-22 20:27:48.561	COMPREHENSIVE_QUALITY	第8章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1000qv1vx3quqk7nok	\N	SINGLE_CHOICE	保教知识与能力模拟题第484题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.564	2026-05-22 20:27:48.564	COMPREHENSIVE_QUALITY	第6章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1200qx1vx3h7ejebk7	\N	SINGLE_CHOICE	综合素质模拟题第485题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.567	2026-05-22 20:27:48.567	COMPREHENSIVE_QUALITY	第10章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1400qz1vx3ijodei8x	\N	SINGLE_CHOICE	综合素质模拟题第486题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.569	2026-05-22 20:27:48.569	COMPREHENSIVE_QUALITY	第9章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1700r11vx3108zguaa	\N	SINGLE_CHOICE	教育知识与能力模拟题第487题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.571	2026-05-22 20:27:48.571	EDUCATION_KNOWLEDGE	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1a00r31vx3ymxxk48g	\N	SINGLE_CHOICE	保教知识与能力模拟题第488题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.574	2026-05-22 20:27:48.574	COMPREHENSIVE_QUALITY	第4章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1d00r51vx3yw4ie24p	\N	SINGLE_CHOICE	保教知识与能力模拟题第489题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.577	2026-05-22 20:27:48.577	COMPREHENSIVE_QUALITY	第9章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1f00r71vx3bpopu3nh	\N	SINGLE_CHOICE	教育知识与能力模拟题第490题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.58	2026-05-22 20:27:48.58	EDUCATION_KNOWLEDGE	第10章	教师观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1j00r91vx3rkzyl5ce	\N	SINGLE_CHOICE	综合素质模拟题第491题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.583	2026-05-22 20:27:48.583	COMPREHENSIVE_QUALITY	第1章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1l00rb1vx36akxsr4a	\N	SINGLE_CHOICE	教育知识与能力模拟题第492题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.586	2026-05-22 20:27:48.586	EDUCATION_KNOWLEDGE	第10章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1o00rd1vx3nzzqgzch	\N	SINGLE_CHOICE	教育知识与能力模拟题第493题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.589	2026-05-22 20:27:48.589	EDUCATION_KNOWLEDGE	第5章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1r00rf1vx3ci4eqfgm	\N	SINGLE_CHOICE	综合素质模拟题第494题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.591	2026-05-22 20:27:48.591	COMPREHENSIVE_QUALITY	第4章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1u00rh1vx3stdp4s7u	\N	SINGLE_CHOICE	综合素质模拟题第495题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.594	2026-05-22 20:27:48.594	COMPREHENSIVE_QUALITY	第1章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv1x00rj1vx3iobmabm1	\N	SINGLE_CHOICE	综合素质模拟题第496题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.597	2026-05-22 20:27:48.597	COMPREHENSIVE_QUALITY	第2章	教育观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv2000rl1vx3lsblshwr	\N	SINGLE_CHOICE	保教知识与能力模拟题第497题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.601	2026-05-22 20:27:48.601	COMPREHENSIVE_QUALITY	第2章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv2300rn1vx3nokzk7to	\N	SINGLE_CHOICE	教育知识与能力模拟题第498题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.604	2026-05-22 20:27:48.604	EDUCATION_KNOWLEDGE	第4章	学生观	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv2500rp1vx3zqux2d04	\N	SINGLE_CHOICE	教育知识与能力模拟题第499题：以下哪项最符合教育理念？	A	素质教育强调以学生发展为中心。	3	2026-05-22 20:27:48.606	2026-05-22 20:27:48.606	EDUCATION_KNOWLEDGE	第4章	职业道德	\N	{}	ORIGINAL	\N	\N	\N	\N
cmphdfv2800rr1vx3yz9mg2gy	\N	SINGLE_CHOICE	教育知识与能力模拟题第500题：以下哪项最符合教育理念？	A	【考查范围】教育知识与能力 / 第5章 / 班级管理\n【题型难度】单选，难度 3/5。\n【正确答案】A\n【解析思路】本题围绕“班级管理”展开。作答时先定位题干关键词，再匹配教师资格证考试中的核心概念，排除与题意不符或表述过度的选项/论点。\n【备考提醒】建议把本题加入同知识点错题复盘，整理易混概念和答题模板。	3	2026-05-22 20:27:48.609	2026-05-22 20:27:56.479	EDUCATION_KNOWLEDGE	第5章	班级管理	\N	{}	ORIGINAL	\N	\N	\N	\N
\.


--
-- Data for Name: QuestionBank; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."QuestionBank" (id, name, "examTrack", "createdAt", "updatedAt", subject) FROM stdin;
seed-question-bank	教师资格证综合素质题库	PRIMARY	2026-05-22 15:30:46.948	2026-05-22 15:30:46.948	COMPREHENSIVE_QUALITY
\.


--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RolePermission" (id, role, module, enabled, "createdAt", "updatedAt") FROM stdin;
cmpj55un40003qny1qmh925i0	CAMPUS_MANAGER	dashboard	t	2026-05-24 02:11:36.929	2026-05-24 09:03:10.171
cmpj55un40002qny1wm3kspvp	CAMPUS_MANAGER	crm	t	2026-05-24 02:11:36.929	2026-05-24 09:03:10.172
cmpj55un40007qny1s6klq69p	CAMPUS_MANAGER	student-service	t	2026-05-24 02:11:36.929	2026-05-24 09:03:10.173
cmpj55un40004qny1bmw6yzff	CAMPUS_MANAGER	question-bank	f	2026-05-24 02:11:36.929	2026-05-24 09:03:10.173
cmpj55un40001qny1t4d2ugzx	CAMPUS_MANAGER	content	t	2026-05-24 02:11:36.929	2026-05-24 09:03:10.174
cmpj55un40000qny1zztk8ggt	CAMPUS_MANAGER	analytics	t	2026-05-24 02:11:36.929	2026-05-24 09:03:10.174
cmpj55un40006qny1blo9ew43	CAMPUS_MANAGER	sop	t	2026-05-24 02:11:36.929	2026-05-24 09:03:10.175
cmpj55un40005qny1ardxzi3g	CAMPUS_MANAGER	settings	f	2026-05-24 02:11:36.929	2026-05-24 09:03:10.175
cmpj3fol6000o6vxrv3jsc72g	ADMISSIONS_COUNSELOR	dashboard	t	2026-05-24 01:23:16.41	2026-05-24 09:03:10.175
cmpj3fol6000p6vxretr42qur	ADMISSIONS_COUNSELOR	crm	t	2026-05-24 01:23:16.41	2026-05-24 09:03:10.176
cmpj3fol6000q6vxrn5c4nyyp	ADMISSIONS_COUNSELOR	student-service	t	2026-05-24 01:23:16.41	2026-05-24 09:03:10.176
cmpj3fol6000r6vxroi65yhmx	ADMISSIONS_COUNSELOR	question-bank	f	2026-05-24 01:23:16.41	2026-05-24 09:03:10.177
cmpj3fol6000s6vxr3gje7l52	ADMISSIONS_COUNSELOR	content	f	2026-05-24 01:23:16.41	2026-05-24 09:03:10.177
cmpj3fol6000t6vxr7yvk7nfa	ADMISSIONS_COUNSELOR	analytics	f	2026-05-24 01:23:16.41	2026-05-24 09:03:10.178
cmpj3fol6000u6vxrrbqvtumf	ADMISSIONS_COUNSELOR	sop	f	2026-05-24 01:23:16.41	2026-05-24 09:03:10.178
cmpj3fol6000v6vxrqsmm7078	ADMISSIONS_COUNSELOR	settings	f	2026-05-24 01:23:16.41	2026-05-24 09:03:10.178
cmpjj30ku000ggr36x2un74lk	ACADEMIC_TEACHER	dashboard	t	2026-05-24 08:41:19.278	2026-05-24 09:03:10.179
cmpjj30ku000hgr36woew756g	ACADEMIC_TEACHER	crm	f	2026-05-24 08:41:19.279	2026-05-24 09:03:10.179
cmpjj30kv000igr36icpol2zj	ACADEMIC_TEACHER	student-service	t	2026-05-24 08:41:19.279	2026-05-24 09:03:10.18
cmpjj30kv000jgr36x3t9rvlf	ACADEMIC_TEACHER	question-bank	t	2026-05-24 08:41:19.28	2026-05-24 09:03:10.18
cmpjj30kw000kgr36327o7ww5	ACADEMIC_TEACHER	content	t	2026-05-24 08:41:19.28	2026-05-24 09:03:10.181
cmpjj30kw000lgr36cq8zyp9l	ACADEMIC_TEACHER	analytics	f	2026-05-24 08:41:19.281	2026-05-24 09:03:10.181
cmpjj30kx000mgr36zyodag5c	ACADEMIC_TEACHER	sop	f	2026-05-24 08:41:19.281	2026-05-24 09:03:10.182
cmpjj30ky000ngr361yhu50ke	ACADEMIC_TEACHER	settings	f	2026-05-24 08:41:19.282	2026-05-24 09:03:10.182
cmpiypq8y000g6ld8dudg59ot	LECTURER	dashboard	t	2026-05-23 23:11:07.041	2026-05-24 09:03:10.183
cmpiypq8y000h6ld8hrmhtxbh	LECTURER	crm	f	2026-05-23 23:11:07.041	2026-05-24 09:03:10.183
cmpiypq8y000i6ld8kw00oyzm	LECTURER	student-service	f	2026-05-23 23:11:07.041	2026-05-24 09:03:10.184
cmpiypq8y000j6ld89k6jvqz5	LECTURER	question-bank	t	2026-05-23 23:11:07.041	2026-05-24 09:03:10.184
cmpiypq8y000k6ld8gjiwnnac	LECTURER	content	t	2026-05-23 23:11:07.041	2026-05-24 09:03:10.185
cmpiypq8y000l6ld8sf8fzgwo	LECTURER	analytics	f	2026-05-23 23:11:07.041	2026-05-24 09:03:10.185
cmpiypq8y000m6ld8sgje3g6s	LECTURER	sop	f	2026-05-23 23:11:07.041	2026-05-24 09:03:10.186
cmpiypq8y000n6ld8q7mmmf3v	LECTURER	settings	f	2026-05-23 23:11:07.041	2026-05-24 09:03:10.186
\.


--
-- Data for Name: ServiceTicket; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ServiceTicket" (id, "studentId", "ownerId", title, status, "aiSuggestion", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SopExecution; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SopExecution" (id, "sopTemplateId", "campusId", owner, progress, "createdAt", "updatedAt") FROM stdin;
seed-sop-execution-hq	seed-sop	cmph2tvrl0002aptpqky8hzkp	校区负责人	33	2026-05-22 17:35:31.275	2026-05-24 00:19:00.615
\.


--
-- Data for Name: SopInspection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SopInspection" (id, "sopTemplateId", "sopExecutionId", "inspectorId", score, checklist, comment, "createdAt") FROM stdin;
\.


--
-- Data for Name: SopStep; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SopStep" (id, "sopTemplateId", title, description, "sortOrder", standard, "ownerRole") FROM stdin;
cmph2tvs8000faptpnlkac63a	seed-sop	搭建招生账号与线索池	\N	1	\N	\N
cmph2tvs8000gaptpgvz0ycqv	seed-sop	完成首周地推与社群排期	\N	2	\N	\N
cmph2tvs8000haptpavtycdhn	seed-sop	复盘线索转化数据	\N	3	\N	\N
cmph7aapq000lqjhl11ijgxwy	seed-sop-ground-promotion	确认高校点位与物料	\N	1	\N	校区负责人
cmph7aapq000mqjhln6kqdsnl	seed-sop-ground-promotion	执行扫码登记与咨询引导	\N	2	\N	总部运营
cmph7aapq000nqjhl37zgcu67	seed-sop-ground-promotion	当日线索清洗与分配	\N	3	\N	校区负责人
cmph7aapq000oqjhlloa39mcp	seed-sop-ground-promotion	复盘点位转化	\N	4	\N	总部运营
cmph7aapu000pqjhlpcfvkl8f	seed-sop-class-service	发送课前提醒	\N	1	\N	校区负责人
cmph7aapu000qqjhls8c1fa5w	seed-sop-class-service	记录到课与迟到	\N	2	\N	总部运营
cmph7aapu000rqjhlaxm5xo32	seed-sop-class-service	同步作业与资料	\N	3	\N	校区负责人
cmph7aapu000sqjhls3qpwlqo	seed-sop-class-service	缺课学员补课跟进	\N	4	\N	总部运营
cmph7aapw000tqjhlrm6oqe6d	seed-sop-campus-agent	招募并登记校园代理	\N	1	\N	校区负责人
cmph7aapw000uqjhlmb7na7we	seed-sop-campus-agent	完成代理培训	\N	2	\N	总部运营
cmph7aapw000vqjhl4xuujhzh	seed-sop-campus-agent	分配社群与朋友圈任务	\N	3	\N	校区负责人
cmph7aapw000wqjhlach88dfc	seed-sop-campus-agent	按周核算线索质量	\N	4	\N	总部运营
cmph7aapy000xqjhl0zkx3dkt	seed-sop-class-opening	建立班级与学员名单	\N	1	\N	校区负责人
cmph7aapy000yqjhlhwj8x4la	seed-sop-class-opening	确认课表和授课老师	\N	2	\N	总部运营
cmph7aapy000zqjhljcjuzv6e	seed-sop-class-opening	发放资料并完成入群	\N	3	\N	校区负责人
cmph7aapy0010qjhl198jodch	seed-sop-class-opening	首课后收集反馈	\N	4	\N	总部运营
cmph7aaq10011qjhlidy0y617	seed-sop-refund	登记退费或投诉原因	\N	1	\N	校区负责人
cmph7aaq10012qjhlifab2w10	seed-sop-refund	核实合同与服务记录	\N	2	\N	总部运营
cmph7aaq10013qjhlhwule751	seed-sop-refund	制定补救或退费方案	\N	3	\N	校区负责人
cmph7aaq10014qjhl96i8r65e	seed-sop-refund	总部复核并归档	\N	4	\N	总部运营
\.


--
-- Data for Name: SopTask; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SopTask" (id, "sopTemplateId", "sopExecutionId", "campusId", title, description, status, "dueDate", "completedAt", "createdAt", "updatedAt") FROM stdin;
seed-sop-task-001	seed-sop	seed-sop-execution-hq	cmph2tvrl0002aptpqky8hzkp	完成首周高校点位排期	至少确认 3 个高校点位，明确物料、人员和每日目标。	IN_PROGRESS	2026-06-03 10:00:00	\N	2026-05-22 17:35:31.277	2026-05-22 17:35:31.277
\.


--
-- Data for Name: SopTaskCheckIn; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SopTaskCheckIn" (id, "taskId", "userId", note, evidence, "createdAt") FROM stdin;
\.


--
-- Data for Name: SopTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SopTemplate" (id, title, module, status, version, "createdAt", "updatedAt", category, summary, document) FROM stdin;
seed-sop	新校区招生启动 SOP	校区复制	ACTIVE	1	2026-05-22 15:30:46.952	2026-05-24 00:19:00.602	NEW_CAMPUS_LAUNCH	新校区从招生账号、线索池、地推排期到首周复盘的启动流程。	1. 总部确认校区启动目标。\n2. 校区完成招生账号、企微、社群和线索表准备。\n3. 首周执行地推、朋友圈和咨询转化动作。\n4. 每日提交任务打卡，每周提交经营周报。
seed-sop-ground-promotion	招生地推 SOP	招生 SOP	ACTIVE	1	2026-05-22 17:35:31.263	2026-05-24 00:19:00.606	GROUND_PROMOTION	规范校园地推点位选择、话术、扫码登记、线索分配和日复盘。	地推前确认高校点位、物料、优惠口径和登记表；地推中按统一话术收集线索；地推后 2 小时内完成线索清洗和首次触达。
seed-sop-class-service	教务上课服务 SOP	教务 SOP	ACTIVE	1	2026-05-22 17:35:31.266	2026-05-24 00:19:00.608	CLASS_SERVICE	统一课前提醒、到课记录、作业布置、课后反馈和缺课跟进。	课前 24 小时和 2 小时提醒；课中记录到课；课后同步作业与资料；缺课学员当天完成关怀和补课安排。
seed-sop-campus-agent	校园代理 SOP	高校合作	ACTIVE	1	2026-05-22 17:35:31.269	2026-05-24 00:19:00.61	UNIVERSITY_COOPERATION	规范校园代理招募、培训、任务分配、线索结算和风险管理。	代理招募需登记学校、年级、社群资源；总部统一培训话术和素材；线索按表单归因，按周复盘有效线索和转化。
seed-sop-class-opening	开班 SOP	教务 SOP	ACTIVE	1	2026-05-22 17:35:31.271	2026-05-24 00:19:00.611	STUDENT_ONBOARDING	开班前完成班级建档、学员入群、课表确认、资料发放和服务说明。	开班前 3 天确认班级、老师、课表、教材和社群；开班当天完成服务规则说明；首课后收集学员问题。
seed-sop-refund	退费与投诉处理 SOP	风控服务	ACTIVE	1	2026-05-22 17:35:31.273	2026-05-24 00:19:00.613	REFUND_COMPLAINT	统一退费、投诉、服务补救和总部升级处理口径。	收到退费或投诉后 2 小时内响应；先核实合同、上课和服务记录；提出补救方案；重大风险升级总部。
\.


--
-- Data for Name: SopWeeklyReport; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SopWeeklyReport" (id, "sopTemplateId", "sopExecutionId", "campusId", "reporterId", "weekStart", summary, blockers, "nextPlan", metrics, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Student" (id, "campusId", "leadId", name, phone, school, major, "examTrack", "enrolledAt", "createdAt", "updatedAt", "classId", "academicOwnerId", "salesOwnerId", grade, "classType", "studyStatus", "serviceNote", "idNumber") FROM stdin;
cmph8x3am0002hxgau7g9nk9x	cmph2tvrl0002aptpqky8hzkp	cmph7or6e0001qvf04ij4u7un	张三	183813305589	97897	89789	PRIMARY	2026-05-22 18:21:14.351	2026-05-22 18:21:14.351	2026-05-24 08:04:32.7	\N	\N	\N	9787	\N	REFUNDED	122	\N
cmph8fliz0001c4yv0q1ff3xl	cmph2tvrl0002aptpqky8hzkp	\N	周自强	18381330558	四川轻化工大学	物联网工程	INFANT	2026-05-22 18:07:38.172	2026-05-22 18:07:38.172	2026-05-24 08:00:22.731	\N	cmph2tvrp0004aptp3qiig9tq	\N	2021级	全程班	NOT_STARTED	我爱你	\N
\.


--
-- Data for Name: StudentClass; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudentClass" (id, "campusId", name, "startAt", "academicOwnerId", "lecturerId", "classType", "examTrack", "createdAt", "updatedAt") FROM stdin;
cmph8h2v7000dc4yv6593r2k6	cmph2tvrl0002aptpqky8hzkp	似懂非懂	2026-05-28 18:08:00	\N	\N	放到沙发上	INFANT	2026-05-22 18:08:47.299	2026-05-22 18:08:47.299
seed-student-class-primary	cmph2tvrl0002aptpqky8hzkp	小学教资周末冲刺班	2026-06-01 01:00:00	cmph2tvrp0004aptp3qiig9tq	cmph2tvrp0004aptp3qiig9tq	周末冲刺班	PRIMARY	2026-05-22 15:58:48.524	2026-05-24 08:00:22.731
\.


--
-- Data for Name: StudentReminder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudentReminder" (id, "studentId", "classId", "courseSessionId", "creatorId", type, status, title, content, "scheduledAt", "pushedAt", channel, provider, "providerPayload", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StudyPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudyPlan" (id, "studentId", title, "aiSummary", progress, "createdAt", "updatedAt", "planText", "serviceScript") FROM stdin;
cmph8fya30005c4yvsn5rwlix	cmph8fliz0001c4yv0q1ff3xl	周自强 教资备考 AI 学习计划	基于学员档案自动生成的阶段学习安排	0	2026-05-22 18:07:54.699	2026-05-22 18:07:54.699	周自强，四川轻化工大学，2021级，物联网工程，报考幼儿教师资格证。\n第 1 周：完成综合素质基础诊断，建立每日 30 分钟打卡节奏。\n第 2-3 周：集中学习教育知识核心章节，每周完成 2 套章节练习。\n第 4 周：进入真题训练，错题按知识点归档，教务每周复盘一次。\n考前 14 天：每天 1 套模拟卷，重点跟踪作文、材料分析和薄弱题型。\n服务动作：上课前 2 小时提醒，作业截止前 24 小时提醒，连续 2 次未打卡触发教务关怀。	\N
cmph8g2jf0007c4yvtrq79950	cmph8fliz0001c4yv0q1ff3xl	周自强 学员服务话术	基于学员状态自动生成的教务沟通话术	0	2026-05-22 18:08:00.219	2026-05-22 18:08:00.219	\N	周自强同学你好，我是你的教务老师。今天帮你同步一下幼儿教资备考安排。\n这周我们先把上课、作业和打卡节奏稳定下来，我会在关键节点提前提醒你。\n如果你哪天课程或作业有冲突，直接告诉我，我会帮你调整学习计划。\n我也注意到你的服务备注：我爱你，后面会重点跟进。
\.


--
-- Data for Name: TeachingContent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeachingContent" (id, "authorId", title, category, status, "aiPrompt", body, "createdAt", "updatedAt", type, summary, "currentVersion") FROM stdin;
cmphfu9q90002wi2j38lwseg1	cmph2tvrp0004aptp3qiig9tq	综合素质第一章PPT	教资培训	DRAFT	\N	# 综合素质第一章PPT\n\n类型：PPT 大纲\n分类：教资培训\n\n## 内容目标\n- 面向教资培训学员，建立清晰、可交付、可复用的PPT 大纲。\n- 帮助校区老师快速使用统一口径开展教学或招生动作。\n\n## 核心结构\n1. 背景导入：说明本内容适用场景和学员常见问题。\n2. 知识框架：拆解关键概念、答题步骤和易错点。\n3. 示例演练：提供题目、话术或课堂案例。\n4. 复盘任务：给出课后练习、打卡要求或校区执行动作。\n\n## AI 生成依据\n围绕教师资格证考试培训，突出高频考点、授课结构和可执行练习。\n\n## 教研审核关注点\n- 是否符合教师资格证考试最新题型与评分口径。\n- 是否便于校区老师直接使用。\n- 是否需要补充真题、模拟题或学员案例。	2026-05-22 21:35:00.034	2026-05-22 21:35:42.304	PPT_OUTLINE	AI 生成初稿	2
cmphlex4k0004ojeeuyms2wsa	cmph2tvrp0004aptp3qiig9tq	职业理念模板驱动讲义	综合素质/职业理念	DRAFT	模板结构：## 教学目标\n说明本节课学员需要掌握的能力。\n\n## 高频考点\n按考点解释核心概念。\n\n## 命题方向\n结合常考题型说明出题方式。\n\n## 易错提醒\n列出容易混淆的判断点。\n\n## 课堂练习\n给出训练任务。\n高频考点：职业理念高频考点｜命题方向：围绕教育观、学生观、教师观考查概念理解和材料分析，常要求结合教育教学场景判断教师行为。｜易错点：容易把学生是发展中的人与学生是完整的人混淆，材料分析题容易只背概念不结合材料。	# 职业理念模板驱动讲义\n\n## AI 生成约束\n- 本初稿必须按照下方模板结构输出，不允许脱离模板自由生成。\n- 每个核心段落必须引用至少一个高频考点、命题方向或易错点。\n- 未在模板结构和高频考点中出现的信息，只能作为教学衔接补充，不得替代核心内容。\n\n## 基础信息\n- 内容类型：课程讲义\n- 内容分类：综合素质/职业理念\n- 适用科目：综合素质\n- 适用章节：职业理念\n- 使用模板：综合素质讲义模板\n\n## 模板结构 Markdown\n## 教学目标\n说明本节课学员需要掌握的能力。\n\n## 高频考点\n按考点解释核心概念。\n\n## 命题方向\n结合常考题型说明出题方式。\n\n## 易错提醒\n列出容易混淆的判断点。\n\n## 课堂练习\n给出训练任务。\n\n## 高频考点与命题依据\n1. 职业理念高频考点（高频指数：5/5）\n   - 常考题型：单选题、材料分析题\n   - 命题方向：围绕教育观、学生观、教师观考查概念理解和材料分析，常要求结合教育教学场景判断教师行为。\n   - 易错点：容易把学生是发展中的人与学生是完整的人混淆，材料分析题容易只背概念不结合材料。\n   - 关键词：学生观、教师观、素质教育\n\n## 按模板生成的内容初稿\n## 教学目标\n说明本节课学员需要掌握的能力。\n\n## 高频考点\n按考点解释核心概念。\n\n## 命题方向\n结合常考题型说明出题方式。\n\n## 易错提醒\n列出容易混淆的判断点。\n\n## 课堂练习\n给出训练任务。\n\n## 教研审核关注点\n- 模板栏目是否完整保留。\n- 高频考点、命题方向、易错点是否准确进入正文。\n- 是否便于校区老师直接授课、出卷或制作课件。	2026-05-23 00:11:01.556	2026-05-23 00:11:01.556	COURSE_HANDOUT	基于模板和职业理念高频考点生成	1
seed-content	cmph2tvrp0004aptp3qiig9tq	综合素质课程大纲	课程大纲	PUBLISHED	\N	一、职业理念\n二、教育法律法规\n三、教师职业道德\n四、文化素养\n五、基本能力	2026-05-22 15:30:46.95	2026-05-24 00:19:00.595	COURSE_HANDOUT	综合素质核心模块、课时安排与练习任务	6
\.


--
-- Data for Name: TeachingContentExport; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeachingContentExport" (id, "contentId", format, "fileName", "createdAt") FROM stdin;
cmph4svim0003aine6abgeiy8	seed-content	WORD	综合素质课程大纲.doc	2026-05-22 16:25:59.183
cmph4uxef001gaine3f7c8pkl	seed-content	WORD	综合素质课程大纲.doc	2026-05-22 16:27:34.936
cmphcop5a0001zii3kwemx0op	seed-content	WORD	综合素质课程大纲.doc	2026-05-22 20:06:41.23
cmphf5rzz0001m7l4qn4l965x	seed-content	PPT	课程大纲-综合素质课程大纲.pptx	2026-05-22 21:15:57.311
cmphfuua80006wi2jgrfag9ks	seed-content	WORD	综合素质课程大纲.doc	2026-05-22 21:35:26.672
\.


--
-- Data for Name: TeachingContentPublication; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeachingContentPublication" (id, "contentId", "campusId", "publishedAt") FROM stdin;
cmph4pcof000h6jojk2v8xi64	seed-content	cmph2tvrl0002aptpqky8hzkp	2026-05-22 16:31:14.076
\.


--
-- Data for Name: TeachingContentReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeachingContentReview" (id, "contentId", "reviewerId", action, comment, "createdAt") FROM stdin;
cmph4t60a0006ainei1r0g4tw	seed-content	cmph2tvrp0004aptp3qiig9tq	APPROVE	审核通过	2026-05-22 16:26:12.778
cmph4t6dq0009aine9jd6vvzd	seed-content	cmph2tvrp0004aptp3qiig9tq	APPROVE	审核通过	2026-05-22 16:26:13.262
cmph4t7gp000caine9svzyvwa	seed-content	cmph2tvrp0004aptp3qiig9tq	SUBMIT	提交审核	2026-05-22 16:26:14.666
cmph4t8ab000fainertkaozbh	seed-content	cmph2tvrp0004aptp3qiig9tq	SUBMIT	提交审核	2026-05-22 16:26:15.732
cmph4t902000iaine7n39lllg	seed-content	cmph2tvrp0004aptp3qiig9tq	SUBMIT	提交审核	2026-05-22 16:26:16.659
cmph4t9fu000lainel00cbrf6	seed-content	cmph2tvrp0004aptp3qiig9tq	SUBMIT	提交审核	2026-05-22 16:26:17.227
cmph4ta7q000oaine2ggrej08	seed-content	cmph2tvrp0004aptp3qiig9tq	APPROVE	审核通过	2026-05-22 16:26:18.23
cmph4tbh6000rainea7ok8h3g	seed-content	cmph2tvrp0004aptp3qiig9tq	SUBMIT	提交审核	2026-05-22 16:26:19.866
cmph4tqz4000xainejw9pyz78	seed-content	cmph2tvrp0004aptp3qiig9tq	APPROVE	审核通过	2026-05-22 16:26:39.953
cmph4u7u30013ainehow9s503	seed-content	cmph2tvrp0004aptp3qiig9tq	SUBMIT	提交审核	2026-05-22 16:27:01.803
cmph4u8v40016aine3vaw0qmk	seed-content	cmph2tvrp0004aptp3qiig9tq	SUBMIT	提交审核	2026-05-22 16:27:03.136
cmph4ua0o0019aine0kunit29	seed-content	cmph2tvrp0004aptp3qiig9tq	APPROVE	审核通过	2026-05-22 16:27:04.632
cmph4yvru001jaine4xb59ft7	seed-content	cmph2tvrp0004aptp3qiig9tq	SUBMIT	提交审核	2026-05-22 16:30:39.45
cmph4zhua001painewn8ww3aa	seed-content	cmph2tvrp0004aptp3qiig9tq	APPROVE	审核通过	2026-05-22 16:31:08.05
\.


--
-- Data for Name: TeachingContentTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeachingContentTemplate" (id, name, subject, chapter, type, "structureMarkdown", enabled, "createdAt", "updatedAt") FROM stdin;
cmphlebqn0000ojee1jtxuucw	综合素质讲义模板	综合素质	职业理念	COURSE_HANDOUT	## 教学目标\n说明本节课学员需要掌握的能力。\n\n## 高频考点\n按考点解释核心概念。\n\n## 命题方向\n结合常考题型说明出题方式。\n\n## 易错提醒\n列出容易混淆的判断点。\n\n## 课堂练习\n给出训练任务。	t	2026-05-23 00:10:33.839	2026-05-23 00:10:33.839
\.


--
-- Data for Name: TeachingContentVersion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeachingContentVersion" (id, "contentId", version, title, body, "changeNote", "createdAt") FROM stdin;
version-seed-content-1	seed-content	1	综合素质课程大纲		初始化版本	2026-05-22 16:23:09.049
cmph4td7q000uaineey460230	seed-content	2	综合素质课程大纲	# 综合素质课程大纲\n\n类型：课程讲义\n分类：课程大纲\n\n## 内容目标\n- 面向教资培训学员，建立清晰、可交付、可复用的课程讲义。\n- 帮助校区老师快速使用统一口径开展教学或招生动作。\n\n## 核心结构\n1. 背景导入：说明本内容适用场景和学员常见问题。\n2. 知识框架：拆解关键概念、答题步骤和易错点。\n3. 示例演练：提供题目、话术或课堂案例。\n4. 复盘任务：给出课后练习、打卡要求或校区执行动作。\n\n## AI 生成依据\n围绕教师资格证考试培训，突出高频考点、授课结构和可执行练习。\n\n## 教研审核关注点\n- 是否符合教师资格证考试最新题型与评分口径。\n- 是否便于校区老师直接使用。\n- 是否需要补充真题、模拟题或学员案例。	AI 生成初稿	2026-05-22 16:26:22.118
cmph4tsy80010aineo82cyasb	seed-content	3	综合素质课程大纲	# 综合素质课程大纲\n\n类型：课程讲义\n分类：课程大纲\n\n## 内容目标\n- 面向教资培训学员，建立清晰、可交付、可复用的课程讲义。\n- 帮助校区老师快速使用统一口径开展教学或招生动作。\n\n## 核心结构\n1. 背景导入：说明本内容适用场景和学员常见问题。\n2. 知识框架：拆解关键概念、答题步骤和易错点。\n3. 示例演练：提供题目、话术或课堂案例。\n4. 复盘任务：给出课后练习、打卡要求或校区执行动作。\n\n## AI 生成依据\n围绕教师资格证考试培训，突出高频考点、授课结构和可执行练习。\n\n## 教研审核关注点\n- 是否符合教师资格证考试最新题型与评分口径。\n- 是否便于校区老师直接使用。\n- 是否需要补充真题、模拟题或学员案例。	AI 生成初稿	2026-05-22 16:26:42.512
cmph4uf81001cainesrdmttxg	seed-content	4	综合素质课程大纲	# 综合素质课程大纲\n\n类型：课程讲义\n分类：课程大纲\n\n## 内容目标\n- 面向教资培训学员，建立清晰、可交付、可复用的课程讲义。\n- 帮助校区老师快速使用统一口径开展教学或招生动作。\n\n## 核心结构\n1. 背景导入：说明本内容适用场景和学员常见问题。\n2. 知识框架：拆解关键概念、答题步骤和易错点。\n3. 示例演练：提供题目、话术或课堂案例。\n4. 复盘任务：给出课后练习、打卡要求或校区执行动作。\n\n## AI 生成依据\n围绕教师资格证考试培训，突出高频考点、授课结构和可执行练习。\n\n## 教研审核关注点\n- 是否符合教师资格证考试最新题型与评分口径。\n- 是否便于校区老师直接使用。\n- 是否需要补充真题、模拟题或学员案例。	AI 生成初稿	2026-05-22 16:27:11.377
cmph4yy2p001maineke50vzgy	seed-content	5	综合素质课程大纲	# 综合素质课程大纲\n\n类型：课程讲义\n分类：课程大纲\n\n## 内容目标\n- 面向教资培训学员，建立清晰、可交付、可复用的课程讲义。\n- 帮助校区老师快速使用统一口径开展教学或招生动作。\n\n## 核心结构\n1. 背景导入：说明本内容适用场景和学员常见问题。\n2. 知识框架：拆解关键概念、答题步骤和易错点。\n3. 示例演练：提供题目、话术或课堂案例。\n4. 复盘任务：给出课后练习、打卡要求或校区执行动作。\n\n## AI 生成依据\n围绕教师资格证考试培训，突出高频考点、授课结构和可执行练习。\n\n## 教研审核关注点\n- 是否符合教师资格证考试最新题型与评分口径。\n- 是否便于校区老师直接使用。\n- 是否需要补充真题、模拟题或学员案例。	AI 生成初稿	2026-05-22 16:30:42.433
cmphfu9qk0004wi2jz3x8vyab	cmphfu9q90002wi2j38lwseg1	1	综合素质第一章PPT		新建内容	2026-05-22 21:35:00.045
cmphfv6ck0009wi2jlmxpue5r	cmphfu9q90002wi2j38lwseg1	2	综合素质第一章PPT	# 综合素质第一章PPT\n\n类型：PPT 大纲\n分类：教资培训\n\n## 内容目标\n- 面向教资培训学员，建立清晰、可交付、可复用的PPT 大纲。\n- 帮助校区老师快速使用统一口径开展教学或招生动作。\n\n## 核心结构\n1. 背景导入：说明本内容适用场景和学员常见问题。\n2. 知识框架：拆解关键概念、答题步骤和易错点。\n3. 示例演练：提供题目、话术或课堂案例。\n4. 复盘任务：给出课后练习、打卡要求或校区执行动作。\n\n## AI 生成依据\n围绕教师资格证考试培训，突出高频考点、授课结构和可执行练习。\n\n## 教研审核关注点\n- 是否符合教师资格证考试最新题型与评分口径。\n- 是否便于校区老师直接使用。\n- 是否需要补充真题、模拟题或学员案例。	AI 生成初稿	2026-05-22 21:35:42.308
cmphj1x2t000cwi2jnnw843v7	seed-content	6	综合素质课程大纲	# 综合素质课程大纲\n\n类型：课程讲义\n分类：课程大纲\n\n## 内容目标\n- 面向教资培训学员，建立清晰、可交付、可复用的课程讲义。\n- 帮助校区老师快速使用统一口径开展教学或招生动作。\n\n## 核心结构\n1. 背景导入：说明本内容适用场景和学员常见问题。\n2. 知识框架：拆解关键概念、答题步骤和易错点。\n3. 示例演练：提供题目、话术或课堂案例。\n4. 复盘任务：给出课后练习、打卡要求或校区执行动作。\n\n## AI 生成依据\n围绕教师资格证考试培训，突出高频考点、授课结构和可执行练习。\n\n## 教研审核关注点\n- 是否符合教师资格证考试最新题型与评分口径。\n- 是否便于校区老师直接使用。\n- 是否需要补充真题、模拟题或学员案例。	AI 生成初稿	2026-05-22 23:04:55.733
cmphlex4n0006ojee0rvq8o4z	cmphlex4k0004ojeeuyms2wsa	1	职业理念模板驱动讲义	# 职业理念模板驱动讲义\n\n## AI 生成约束\n- 本初稿必须按照下方模板结构输出，不允许脱离模板自由生成。\n- 每个核心段落必须引用至少一个高频考点、命题方向或易错点。\n- 未在模板结构和高频考点中出现的信息，只能作为教学衔接补充，不得替代核心内容。\n\n## 基础信息\n- 内容类型：课程讲义\n- 内容分类：综合素质/职业理念\n- 适用科目：综合素质\n- 适用章节：职业理念\n- 使用模板：综合素质讲义模板\n\n## 模板结构 Markdown\n## 教学目标\n说明本节课学员需要掌握的能力。\n\n## 高频考点\n按考点解释核心概念。\n\n## 命题方向\n结合常考题型说明出题方式。\n\n## 易错提醒\n列出容易混淆的判断点。\n\n## 课堂练习\n给出训练任务。\n\n## 高频考点与命题依据\n1. 职业理念高频考点（高频指数：5/5）\n   - 常考题型：单选题、材料分析题\n   - 命题方向：围绕教育观、学生观、教师观考查概念理解和材料分析，常要求结合教育教学场景判断教师行为。\n   - 易错点：容易把学生是发展中的人与学生是完整的人混淆，材料分析题容易只背概念不结合材料。\n   - 关键词：学生观、教师观、素质教育\n\n## 按模板生成的内容初稿\n## 教学目标\n说明本节课学员需要掌握的能力。\n\n## 高频考点\n按考点解释核心概念。\n\n## 命题方向\n结合常考题型说明出题方式。\n\n## 易错提醒\n列出容易混淆的判断点。\n\n## 课堂练习\n给出训练任务。\n\n## 教研审核关注点\n- 模板栏目是否完整保留。\n- 高频考点、命题方向、易错点是否准确进入正文。\n- 是否便于校区老师直接授课、出卷或制作课件。	根据模板和高频考点生成初稿	2026-05-23 00:11:01.559
\.


--
-- Data for Name: TeachingKeyPoint; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeachingKeyPoint" (id, subject, chapter, name, frequency, "questionTypes", direction, mistakes, keywords, note, "createdAt", "updatedAt") FROM stdin;
cmphlel5c0001ojee9x4b1nym	综合素质	职业理念	职业理念高频考点	5	单选题、材料分析题	围绕教育观、学生观、教师观考查概念理解和材料分析，常要求结合教育教学场景判断教师行为。	容易把学生是发展中的人与学生是完整的人混淆，材料分析题容易只背概念不结合材料。	学生观、教师观、素质教育	\N	2026-05-23 00:10:46.033	2026-05-23 00:10:46.033
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, "organizationId", "campusId", name, phone, "passwordHash", role, status, "createdAt", "updatedAt", "idNumber") FROM stdin;
cmph2tvrp0004aptp3qiig9tq	cmph2tvrd0000aptp4f65dcn2	cmph2tvrl0002aptpqky8hzkp	周自强	18381330558	$2a$10$W0IGhSjEuXgl5QkqvnkUb.0FcIn7WqMpEpEV.4KdqGdfR6tyGwXZu	ADMIN	ACTIVE	2026-05-22 15:30:46.934	2026-05-24 09:28:52.015	51112419920314621X
\.


--
-- Data for Name: UserPermission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserPermission" (id, "userId", module, enabled, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WrongQuestionRecord; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WrongQuestionRecord" (id, "studentId", "questionId", answer, reason, mastered, "wrongAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8b922c8a-6ae0-46d5-acd0-45d39f8f61b9	c74a1e9e2c8670b9512175ae628d67424a324bb4dcab9394edd52ca94ef818c0	2026-05-22 15:30:33.801255+00	20260522153033_init	\N	\N	2026-05-22 15:30:33.746552+00	1
49331591-d21a-412a-9cf2-cb7e8e197fee	f39e54bcfb1c039ba89748dc950f08a54e84d6ec8f96669d55a31994ec772ad8	2026-05-22 15:48:04.415573+00	20260522162000_crm_leads	\N	\N	2026-05-22 15:48:04.395716+00	1
71a7eb9b-b706-4933-9588-835de9831c8d	5d03c20a727432133a9cc8ae406fff99c60dba2b6bb9cb84a85474289fd7ab7e	2026-05-23 22:19:23.808672+00	20260524100000_campus_business_type	\N	\N	2026-05-23 22:19:23.800449+00	1
450ea0f7-3a8d-404e-961a-795510222381	58ccf79a0261d6eb9b08776cc28623d9e13599d9614a67c7c478a3ea21d7b6c4	2026-05-22 15:48:28.310983+00	20260522154828_cd_users_ziqiang_documents_codex_2026_05_22_ai_web_next_js_tailwind_cssnpm_run_prisma_migratenpm_run_db_seednpm_run_dev	\N	\N	2026-05-22 15:48:28.308203+00	1
a7a04ebf-17ad-471d-944f-f65a9c8813bb	ec3a145c0e737ad44e5ec87fa5fa853e2a63a774926abbfbb1398bdc0fe3f5a8	2026-05-22 15:58:42.105393+00	20260522172000_student_service	\N	\N	2026-05-22 15:58:42.058823+00	1
7ec0b1a1-70eb-4d2a-b745-2de397f0c28b	96f68f0bed2b591b2c2515458fdd54a1c6ef9074b7717e1ecd5605dfed67569f	2026-05-24 09:44:48.153256+00	20260524220000_student_id_number	\N	\N	2026-05-24 09:44:48.146604+00	1
e37c4c42-73e1-467b-a0ea-1d080e1db921	c53fedeb31184f52f13afe76b09f45d5d785554beebb2fd4d863984b7d98bd5f	2026-05-22 16:12:30.682195+00	20260523090000_question_bank	\N	\N	2026-05-22 16:12:30.645044+00	1
b7e373bc-0373-477c-9eca-b9253f589822	f673560707c261a49539d719b77a91c83b8f3804b561e22b31c43d057831338a	2026-05-23 22:57:33.279569+00	20260524110000_module_permissions	\N	\N	2026-05-23 22:57:33.25964+00	1
8722e4fd-d8de-47ff-9f8e-c6d57ee85a49	40ae8741ae1cac481b5e53e78b2bc551a2ccba611f32ea2d6d42a66c06f9dc28	2026-05-22 16:23:09.076971+00	20260523100000_teaching_content	\N	\N	2026-05-22 16:23:09.048175+00	1
3d880967-767c-4fac-8c9e-aa53b8045008	7194ba0f7b45a0a6b464c9b2a0dbebdec01cdf8c4f0c2b63ff892c155185a6bc	2026-05-22 16:32:10.138575+00	20260523110000_analytics_reports	\N	\N	2026-05-22 16:32:10.130054+00	1
02c5a488-9de1-41dd-a719-ee1febabe15c	d2f66b7c354300713d9a6223e2ce3e39822ea74efdfd576439920e519c7c17a5	2026-05-22 17:35:26.780076+00	20260523120000_sop_system	\N	\N	2026-05-22 17:35:26.738446+00	1
1d1fe396-e123-404a-8b47-ea02fb57bdc8	2788566ff61b1ffe8b30bac64ee15777fb2f1f92b6a607b3b49f286140125426	2026-05-23 23:52:48.418412+00	20260524130000_remove_hq_operations_role	\N	\N	2026-05-23 23:52:48.38755+00	1
44bcc910-5518-49a5-9063-263f08d6f90a	3ac23c41f9d7e8fb365092088f3f689ec4378883e33feb4d44258bca5bbf2826	2026-05-22 17:59:32.82787+00	20260523130000_student_status_flow	\N	\N	2026-05-22 17:59:32.824285+00	1
ea9b9a20-5681-4e6b-b042-345691d8b7ba	db1bfa045c9d3b75060b3d927cab231b4be2b327648dc3a0887897d7e5f4aaef	2026-05-22 19:19:19.332899+00	20260523140000_system_settings	\N	\N	2026-05-22 19:19:19.310628+00	1
38b9c78b-7697-45b2-9d25-a237d4cafd62	4ceeee29253d5fdb0b7db59477e7932661cc4d7de07cf8e9135f4a86612cdebb	2026-05-22 21:09:10.790481+00	20260523150000_ppt_exports	\N	\N	2026-05-22 21:09:10.785637+00	1
b85fa526-ac92-424d-b93d-da862251e1eb	19118fcbcdc3c78e8bb0e8a92f2fdd6341eb06be24254328af87133897fcefeb	2026-05-24 00:18:50.667117+00	20260524160000_user_id_number_login	\N	\N	2026-05-24 00:18:50.6539+00	1
7b98cd22-6387-4753-b460-41c5c22b6c7c	3cd53417c097fedf6f1959489252a725f564e13b64674647c0ef5119c099eeb6	2026-05-23 00:09:26.371274+00	20260523160000_content_templates_key_points	\N	\N	2026-05-23 00:09:26.353663+00	1
14aa653c-103f-4f04-ba54-f54c0890c075	0f8217c340fb37ca704b5a24b404111c67b2ab61428116800b2ba2a60bcf80d9	2026-05-23 00:23:06.5377+00	20260523170000_paper_level_question_bank	\N	\N	2026-05-23 00:23:06.524745+00	1
b544c170-4479-4e8f-930d-66b8d11b0058	ef824610da933603ee88f9f24bf308bdf7a033f51dfde59cbbf06993b40dc375	2026-05-24 01:35:29.618168+00	20260524190000_campus_assistants	\N	\N	2026-05-24 01:35:29.603517+00	1
19a92b17-7e4a-4cb1-806c-6c5751e267f2	0dca04dae3ca02a1b074872e4293fbb5ec2ee1ec0c44e79d14b0df0ba466cb4d	2026-05-24 08:07:25.524249+00	20260524210000_optional_user_email	\N	\N	2026-05-24 08:07:25.518781+00	1
92d68bdb-53ef-46d0-8ac5-fb95540e63b1	7ba171e4f6a8567a5fc311e0f69b124f8f1b14490f5e7d0fc9c4c106b6c650d7	2026-05-24 08:13:30.723124+00	20260524213000_remove_user_email	\N	\N	2026-05-24 08:13:30.708652+00	1
188b092f-892c-4890-a46f-b4386e5c0038	4398fd07f1467f81d6e1cbafd8010bb47ef04e41ace1a7ddb5310a2af8f8437e	2026-05-24 09:21:43.186202+00	20260524193000_business_dictionary_categories	\N	\N	2026-05-24 09:21:43.173112+00	1
\.


--
-- Name: AnalyticsDailyReport AnalyticsDailyReport_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnalyticsDailyReport"
    ADD CONSTRAINT "AnalyticsDailyReport_pkey" PRIMARY KEY (id);


--
-- Name: AnalyticsMetric AnalyticsMetric_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnalyticsMetric"
    ADD CONSTRAINT "AnalyticsMetric_pkey" PRIMARY KEY (id);


--
-- Name: AttendanceRecord AttendanceRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY (id);


--
-- Name: BusinessDictionaryCategory BusinessDictionaryCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BusinessDictionaryCategory"
    ADD CONSTRAINT "BusinessDictionaryCategory_pkey" PRIMARY KEY (id);


--
-- Name: BusinessDictionary BusinessDictionary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BusinessDictionary"
    ADD CONSTRAINT "BusinessDictionary_pkey" PRIMARY KEY (id);


--
-- Name: CampusAssistant CampusAssistant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampusAssistant"
    ADD CONSTRAINT "CampusAssistant_pkey" PRIMARY KEY (id);


--
-- Name: Campus Campus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campus"
    ADD CONSTRAINT "Campus_pkey" PRIMARY KEY (id);


--
-- Name: CourseSession CourseSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseSession"
    ADD CONSTRAINT "CourseSession_pkey" PRIMARY KEY (id);


--
-- Name: ExamPaperQuestion ExamPaperQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamPaperQuestion"
    ADD CONSTRAINT "ExamPaperQuestion_pkey" PRIMARY KEY (id);


--
-- Name: ExamPaper ExamPaper_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamPaper"
    ADD CONSTRAINT "ExamPaper_pkey" PRIMARY KEY (id);


--
-- Name: LeadFollowUp LeadFollowUp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeadFollowUp"
    ADD CONSTRAINT "LeadFollowUp_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: Organization Organization_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);


--
-- Name: QuestionBank QuestionBank_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuestionBank"
    ADD CONSTRAINT "QuestionBank_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY (id);


--
-- Name: ServiceTicket ServiceTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceTicket"
    ADD CONSTRAINT "ServiceTicket_pkey" PRIMARY KEY (id);


--
-- Name: SopExecution SopExecution_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopExecution"
    ADD CONSTRAINT "SopExecution_pkey" PRIMARY KEY (id);


--
-- Name: SopInspection SopInspection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopInspection"
    ADD CONSTRAINT "SopInspection_pkey" PRIMARY KEY (id);


--
-- Name: SopStep SopStep_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopStep"
    ADD CONSTRAINT "SopStep_pkey" PRIMARY KEY (id);


--
-- Name: SopTaskCheckIn SopTaskCheckIn_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopTaskCheckIn"
    ADD CONSTRAINT "SopTaskCheckIn_pkey" PRIMARY KEY (id);


--
-- Name: SopTask SopTask_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopTask"
    ADD CONSTRAINT "SopTask_pkey" PRIMARY KEY (id);


--
-- Name: SopTemplate SopTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopTemplate"
    ADD CONSTRAINT "SopTemplate_pkey" PRIMARY KEY (id);


--
-- Name: SopWeeklyReport SopWeeklyReport_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopWeeklyReport"
    ADD CONSTRAINT "SopWeeklyReport_pkey" PRIMARY KEY (id);


--
-- Name: StudentClass StudentClass_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentClass"
    ADD CONSTRAINT "StudentClass_pkey" PRIMARY KEY (id);


--
-- Name: StudentReminder StudentReminder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentReminder"
    ADD CONSTRAINT "StudentReminder_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: StudyPlan StudyPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudyPlan"
    ADD CONSTRAINT "StudyPlan_pkey" PRIMARY KEY (id);


--
-- Name: TeachingContentExport TeachingContentExport_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentExport"
    ADD CONSTRAINT "TeachingContentExport_pkey" PRIMARY KEY (id);


--
-- Name: TeachingContentPublication TeachingContentPublication_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentPublication"
    ADD CONSTRAINT "TeachingContentPublication_pkey" PRIMARY KEY (id);


--
-- Name: TeachingContentReview TeachingContentReview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentReview"
    ADD CONSTRAINT "TeachingContentReview_pkey" PRIMARY KEY (id);


--
-- Name: TeachingContentTemplate TeachingContentTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentTemplate"
    ADD CONSTRAINT "TeachingContentTemplate_pkey" PRIMARY KEY (id);


--
-- Name: TeachingContentVersion TeachingContentVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentVersion"
    ADD CONSTRAINT "TeachingContentVersion_pkey" PRIMARY KEY (id);


--
-- Name: TeachingContent TeachingContent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContent"
    ADD CONSTRAINT "TeachingContent_pkey" PRIMARY KEY (id);


--
-- Name: TeachingKeyPoint TeachingKeyPoint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingKeyPoint"
    ADD CONSTRAINT "TeachingKeyPoint_pkey" PRIMARY KEY (id);


--
-- Name: UserPermission UserPermission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPermission"
    ADD CONSTRAINT "UserPermission_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WrongQuestionRecord WrongQuestionRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WrongQuestionRecord"
    ADD CONSTRAINT "WrongQuestionRecord_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AnalyticsDailyReport_reportDate_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AnalyticsDailyReport_reportDate_key" ON public."AnalyticsDailyReport" USING btree ("reportDate");


--
-- Name: AnalyticsMetric_scope_metricKey_measuredAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AnalyticsMetric_scope_metricKey_measuredAt_idx" ON public."AnalyticsMetric" USING btree (scope, "metricKey", "measuredAt");


--
-- Name: AttendanceRecord_courseSessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AttendanceRecord_courseSessionId_idx" ON public."AttendanceRecord" USING btree ("courseSessionId");


--
-- Name: AttendanceRecord_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AttendanceRecord_status_idx" ON public."AttendanceRecord" USING btree (status);


--
-- Name: AttendanceRecord_studentId_courseSessionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AttendanceRecord_studentId_courseSessionId_key" ON public."AttendanceRecord" USING btree ("studentId", "courseSessionId");


--
-- Name: BusinessDictionaryCategory_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BusinessDictionaryCategory_code_key" ON public."BusinessDictionaryCategory" USING btree (code);


--
-- Name: BusinessDictionaryCategory_isSystem_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BusinessDictionaryCategory_isSystem_idx" ON public."BusinessDictionaryCategory" USING btree ("isSystem");


--
-- Name: BusinessDictionary_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BusinessDictionary_enabled_idx" ON public."BusinessDictionary" USING btree (enabled);


--
-- Name: BusinessDictionary_organizationId_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BusinessDictionary_organizationId_category_idx" ON public."BusinessDictionary" USING btree ("organizationId", category);


--
-- Name: BusinessDictionary_organizationId_category_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BusinessDictionary_organizationId_category_name_key" ON public."BusinessDictionary" USING btree ("organizationId", category, name);


--
-- Name: CampusAssistant_campusId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CampusAssistant_campusId_idx" ON public."CampusAssistant" USING btree ("campusId");


--
-- Name: CampusAssistant_campusId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CampusAssistant_campusId_userId_key" ON public."CampusAssistant" USING btree ("campusId", "userId");


--
-- Name: CampusAssistant_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CampusAssistant_userId_idx" ON public."CampusAssistant" USING btree ("userId");


--
-- Name: Campus_businessType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Campus_businessType_idx" ON public."Campus" USING btree ("businessType");


--
-- Name: Campus_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Campus_code_key" ON public."Campus" USING btree (code);


--
-- Name: Campus_managerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Campus_managerId_idx" ON public."Campus" USING btree ("managerId");


--
-- Name: Campus_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Campus_organizationId_idx" ON public."Campus" USING btree ("organizationId");


--
-- Name: Campus_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Campus_status_idx" ON public."Campus" USING btree (status);


--
-- Name: CourseSession_campusId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CourseSession_campusId_idx" ON public."CourseSession" USING btree ("campusId");


--
-- Name: CourseSession_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CourseSession_classId_idx" ON public."CourseSession" USING btree ("classId");


--
-- Name: CourseSession_lecturerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CourseSession_lecturerId_idx" ON public."CourseSession" USING btree ("lecturerId");


--
-- Name: CourseSession_startsAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CourseSession_startsAt_idx" ON public."CourseSession" USING btree ("startsAt");


--
-- Name: ExamPaperQuestion_paperId_questionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ExamPaperQuestion_paperId_questionId_key" ON public."ExamPaperQuestion" USING btree ("paperId", "questionId");


--
-- Name: ExamPaperQuestion_questionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamPaperQuestion_questionId_idx" ON public."ExamPaperQuestion" USING btree ("questionId");


--
-- Name: ExamPaper_paperType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamPaper_paperType_idx" ON public."ExamPaper" USING btree ("paperType");


--
-- Name: ExamPaper_questionBankId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamPaper_questionBankId_idx" ON public."ExamPaper" USING btree ("questionBankId");


--
-- Name: ExamPaper_stage_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamPaper_stage_idx" ON public."ExamPaper" USING btree (stage);


--
-- Name: ExamPaper_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamPaper_status_idx" ON public."ExamPaper" USING btree (status);


--
-- Name: ExamPaper_subject_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamPaper_subject_idx" ON public."ExamPaper" USING btree (subject);


--
-- Name: ExamPaper_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamPaper_year_idx" ON public."ExamPaper" USING btree (year);


--
-- Name: LeadFollowUp_creatorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeadFollowUp_creatorId_idx" ON public."LeadFollowUp" USING btree ("creatorId");


--
-- Name: LeadFollowUp_followAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeadFollowUp_followAt_idx" ON public."LeadFollowUp" USING btree ("followAt");


--
-- Name: LeadFollowUp_leadId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeadFollowUp_leadId_idx" ON public."LeadFollowUp" USING btree ("leadId");


--
-- Name: LeadFollowUp_nextAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeadFollowUp_nextAt_idx" ON public."LeadFollowUp" USING btree ("nextAt");


--
-- Name: Lead_assigneeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_assigneeId_idx" ON public."Lead" USING btree ("assigneeId");


--
-- Name: Lead_campusId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_campusId_idx" ON public."Lead" USING btree ("campusId");


--
-- Name: Lead_intentLevel_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_intentLevel_idx" ON public."Lead" USING btree ("intentLevel");


--
-- Name: Lead_nextFollowUpAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_nextFollowUpAt_idx" ON public."Lead" USING btree ("nextFollowUpAt");


--
-- Name: Lead_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_phone_idx" ON public."Lead" USING btree (phone);


--
-- Name: Lead_sourceChannel_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_sourceChannel_idx" ON public."Lead" USING btree ("sourceChannel");


--
-- Name: Lead_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_status_idx" ON public."Lead" USING btree (status);


--
-- Name: Organization_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Organization_code_key" ON public."Organization" USING btree (code);


--
-- Name: QuestionBank_examTrack_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "QuestionBank_examTrack_idx" ON public."QuestionBank" USING btree ("examTrack");


--
-- Name: QuestionBank_subject_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "QuestionBank_subject_idx" ON public."QuestionBank" USING btree (subject);


--
-- Name: Question_chapter_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_chapter_idx" ON public."Question" USING btree (chapter);


--
-- Name: Question_difficulty_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_difficulty_idx" ON public."Question" USING btree (difficulty);


--
-- Name: Question_knowledgePoint_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_knowledgePoint_idx" ON public."Question" USING btree ("knowledgePoint");


--
-- Name: Question_paperId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_paperId_idx" ON public."Question" USING btree ("paperId");


--
-- Name: Question_questionBankId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_questionBankId_idx" ON public."Question" USING btree ("questionBankId");


--
-- Name: Question_questionNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_questionNo_idx" ON public."Question" USING btree ("questionNo");


--
-- Name: Question_source_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_source_idx" ON public."Question" USING btree (source);


--
-- Name: Question_subject_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_subject_idx" ON public."Question" USING btree (subject);


--
-- Name: Question_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_type_idx" ON public."Question" USING btree (type);


--
-- Name: Question_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Question_year_idx" ON public."Question" USING btree (year);


--
-- Name: RolePermission_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RolePermission_enabled_idx" ON public."RolePermission" USING btree (enabled);


--
-- Name: RolePermission_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RolePermission_module_idx" ON public."RolePermission" USING btree (module);


--
-- Name: RolePermission_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RolePermission_role_idx" ON public."RolePermission" USING btree (role);


--
-- Name: RolePermission_role_module_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "RolePermission_role_module_key" ON public."RolePermission" USING btree (role, module);


--
-- Name: ServiceTicket_ownerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceTicket_ownerId_idx" ON public."ServiceTicket" USING btree ("ownerId");


--
-- Name: ServiceTicket_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceTicket_status_idx" ON public."ServiceTicket" USING btree (status);


--
-- Name: ServiceTicket_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceTicket_studentId_idx" ON public."ServiceTicket" USING btree ("studentId");


--
-- Name: SopExecution_campusId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopExecution_campusId_idx" ON public."SopExecution" USING btree ("campusId");


--
-- Name: SopExecution_sopTemplateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopExecution_sopTemplateId_idx" ON public."SopExecution" USING btree ("sopTemplateId");


--
-- Name: SopInspection_inspectorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopInspection_inspectorId_idx" ON public."SopInspection" USING btree ("inspectorId");


--
-- Name: SopInspection_sopExecutionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopInspection_sopExecutionId_idx" ON public."SopInspection" USING btree ("sopExecutionId");


--
-- Name: SopInspection_sopTemplateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopInspection_sopTemplateId_idx" ON public."SopInspection" USING btree ("sopTemplateId");


--
-- Name: SopStep_sopTemplateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopStep_sopTemplateId_idx" ON public."SopStep" USING btree ("sopTemplateId");


--
-- Name: SopTaskCheckIn_taskId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopTaskCheckIn_taskId_idx" ON public."SopTaskCheckIn" USING btree ("taskId");


--
-- Name: SopTaskCheckIn_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopTaskCheckIn_userId_idx" ON public."SopTaskCheckIn" USING btree ("userId");


--
-- Name: SopTask_campusId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopTask_campusId_idx" ON public."SopTask" USING btree ("campusId");


--
-- Name: SopTask_dueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopTask_dueDate_idx" ON public."SopTask" USING btree ("dueDate");


--
-- Name: SopTask_sopExecutionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopTask_sopExecutionId_idx" ON public."SopTask" USING btree ("sopExecutionId");


--
-- Name: SopTask_sopTemplateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopTask_sopTemplateId_idx" ON public."SopTask" USING btree ("sopTemplateId");


--
-- Name: SopTask_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopTask_status_idx" ON public."SopTask" USING btree (status);


--
-- Name: SopTemplate_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopTemplate_category_idx" ON public."SopTemplate" USING btree (category);


--
-- Name: SopTemplate_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopTemplate_status_idx" ON public."SopTemplate" USING btree (status);


--
-- Name: SopWeeklyReport_campusId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopWeeklyReport_campusId_idx" ON public."SopWeeklyReport" USING btree ("campusId");


--
-- Name: SopWeeklyReport_sopExecutionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopWeeklyReport_sopExecutionId_idx" ON public."SopWeeklyReport" USING btree ("sopExecutionId");


--
-- Name: SopWeeklyReport_sopTemplateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopWeeklyReport_sopTemplateId_idx" ON public."SopWeeklyReport" USING btree ("sopTemplateId");


--
-- Name: SopWeeklyReport_weekStart_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SopWeeklyReport_weekStart_idx" ON public."SopWeeklyReport" USING btree ("weekStart");


--
-- Name: StudentClass_academicOwnerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentClass_academicOwnerId_idx" ON public."StudentClass" USING btree ("academicOwnerId");


--
-- Name: StudentClass_campusId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentClass_campusId_idx" ON public."StudentClass" USING btree ("campusId");


--
-- Name: StudentClass_lecturerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentClass_lecturerId_idx" ON public."StudentClass" USING btree ("lecturerId");


--
-- Name: StudentReminder_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentReminder_classId_idx" ON public."StudentReminder" USING btree ("classId");


--
-- Name: StudentReminder_courseSessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentReminder_courseSessionId_idx" ON public."StudentReminder" USING btree ("courseSessionId");


--
-- Name: StudentReminder_scheduledAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentReminder_scheduledAt_idx" ON public."StudentReminder" USING btree ("scheduledAt");


--
-- Name: StudentReminder_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentReminder_status_idx" ON public."StudentReminder" USING btree (status);


--
-- Name: StudentReminder_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentReminder_studentId_idx" ON public."StudentReminder" USING btree ("studentId");


--
-- Name: StudentReminder_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentReminder_type_idx" ON public."StudentReminder" USING btree (type);


--
-- Name: Student_academicOwnerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_academicOwnerId_idx" ON public."Student" USING btree ("academicOwnerId");


--
-- Name: Student_campusId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_campusId_idx" ON public."Student" USING btree ("campusId");


--
-- Name: Student_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_classId_idx" ON public."Student" USING btree ("classId");


--
-- Name: Student_idNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_idNumber_idx" ON public."Student" USING btree ("idNumber");


--
-- Name: Student_leadId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Student_leadId_key" ON public."Student" USING btree ("leadId");


--
-- Name: Student_salesOwnerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_salesOwnerId_idx" ON public."Student" USING btree ("salesOwnerId");


--
-- Name: Student_studyStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_studyStatus_idx" ON public."Student" USING btree ("studyStatus");


--
-- Name: StudyPlan_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudyPlan_studentId_idx" ON public."StudyPlan" USING btree ("studentId");


--
-- Name: TeachingContentExport_contentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentExport_contentId_idx" ON public."TeachingContentExport" USING btree ("contentId");


--
-- Name: TeachingContentExport_format_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentExport_format_idx" ON public."TeachingContentExport" USING btree (format);


--
-- Name: TeachingContentPublication_campusId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentPublication_campusId_idx" ON public."TeachingContentPublication" USING btree ("campusId");


--
-- Name: TeachingContentPublication_contentId_campusId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TeachingContentPublication_contentId_campusId_key" ON public."TeachingContentPublication" USING btree ("contentId", "campusId");


--
-- Name: TeachingContentReview_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentReview_action_idx" ON public."TeachingContentReview" USING btree (action);


--
-- Name: TeachingContentReview_contentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentReview_contentId_idx" ON public."TeachingContentReview" USING btree ("contentId");


--
-- Name: TeachingContentReview_reviewerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentReview_reviewerId_idx" ON public."TeachingContentReview" USING btree ("reviewerId");


--
-- Name: TeachingContentTemplate_chapter_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentTemplate_chapter_idx" ON public."TeachingContentTemplate" USING btree (chapter);


--
-- Name: TeachingContentTemplate_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentTemplate_enabled_idx" ON public."TeachingContentTemplate" USING btree (enabled);


--
-- Name: TeachingContentTemplate_subject_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentTemplate_subject_idx" ON public."TeachingContentTemplate" USING btree (subject);


--
-- Name: TeachingContentTemplate_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentTemplate_type_idx" ON public."TeachingContentTemplate" USING btree (type);


--
-- Name: TeachingContentVersion_contentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContentVersion_contentId_idx" ON public."TeachingContentVersion" USING btree ("contentId");


--
-- Name: TeachingContentVersion_contentId_version_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TeachingContentVersion_contentId_version_key" ON public."TeachingContentVersion" USING btree ("contentId", version);


--
-- Name: TeachingContent_authorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContent_authorId_idx" ON public."TeachingContent" USING btree ("authorId");


--
-- Name: TeachingContent_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContent_category_idx" ON public."TeachingContent" USING btree (category);


--
-- Name: TeachingContent_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContent_status_idx" ON public."TeachingContent" USING btree (status);


--
-- Name: TeachingContent_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingContent_type_idx" ON public."TeachingContent" USING btree (type);


--
-- Name: TeachingKeyPoint_chapter_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingKeyPoint_chapter_idx" ON public."TeachingKeyPoint" USING btree (chapter);


--
-- Name: TeachingKeyPoint_frequency_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingKeyPoint_frequency_idx" ON public."TeachingKeyPoint" USING btree (frequency);


--
-- Name: TeachingKeyPoint_subject_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeachingKeyPoint_subject_idx" ON public."TeachingKeyPoint" USING btree (subject);


--
-- Name: UserPermission_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserPermission_enabled_idx" ON public."UserPermission" USING btree (enabled);


--
-- Name: UserPermission_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserPermission_module_idx" ON public."UserPermission" USING btree (module);


--
-- Name: UserPermission_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserPermission_userId_idx" ON public."UserPermission" USING btree ("userId");


--
-- Name: UserPermission_userId_module_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserPermission_userId_module_key" ON public."UserPermission" USING btree ("userId", module);


--
-- Name: User_campusId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_campusId_idx" ON public."User" USING btree ("campusId");


--
-- Name: User_idNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_idNumber_idx" ON public."User" USING btree ("idNumber");


--
-- Name: User_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_organizationId_idx" ON public."User" USING btree ("organizationId");


--
-- Name: User_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_phone_idx" ON public."User" USING btree (phone);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: WrongQuestionRecord_mastered_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WrongQuestionRecord_mastered_idx" ON public."WrongQuestionRecord" USING btree (mastered);


--
-- Name: WrongQuestionRecord_questionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WrongQuestionRecord_questionId_idx" ON public."WrongQuestionRecord" USING btree ("questionId");


--
-- Name: WrongQuestionRecord_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WrongQuestionRecord_studentId_idx" ON public."WrongQuestionRecord" USING btree ("studentId");


--
-- Name: WrongQuestionRecord_wrongAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WrongQuestionRecord_wrongAt_idx" ON public."WrongQuestionRecord" USING btree ("wrongAt");


--
-- Name: AttendanceRecord AttendanceRecord_courseSessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_courseSessionId_fkey" FOREIGN KEY ("courseSessionId") REFERENCES public."CourseSession"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AttendanceRecord AttendanceRecord_recorderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_recorderId_fkey" FOREIGN KEY ("recorderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AttendanceRecord AttendanceRecord_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttendanceRecord"
    ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BusinessDictionary BusinessDictionary_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BusinessDictionary"
    ADD CONSTRAINT "BusinessDictionary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CampusAssistant CampusAssistant_campusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampusAssistant"
    ADD CONSTRAINT "CampusAssistant_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES public."Campus"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampusAssistant CampusAssistant_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampusAssistant"
    ADD CONSTRAINT "CampusAssistant_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Campus Campus_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campus"
    ADD CONSTRAINT "Campus_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Campus Campus_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campus"
    ADD CONSTRAINT "Campus_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseSession CourseSession_campusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseSession"
    ADD CONSTRAINT "CourseSession_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES public."Campus"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseSession CourseSession_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseSession"
    ADD CONSTRAINT "CourseSession_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."StudentClass"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseSession CourseSession_lecturerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CourseSession"
    ADD CONSTRAINT "CourseSession_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ExamPaperQuestion ExamPaperQuestion_paperId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamPaperQuestion"
    ADD CONSTRAINT "ExamPaperQuestion_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES public."ExamPaper"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExamPaperQuestion ExamPaperQuestion_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamPaperQuestion"
    ADD CONSTRAINT "ExamPaperQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ExamPaper ExamPaper_questionBankId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamPaper"
    ADD CONSTRAINT "ExamPaper_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES public."QuestionBank"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LeadFollowUp LeadFollowUp_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeadFollowUp"
    ADD CONSTRAINT "LeadFollowUp_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LeadFollowUp LeadFollowUp_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeadFollowUp"
    ADD CONSTRAINT "LeadFollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lead Lead_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_campusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES public."Campus"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lead Lead_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Question Question_paperId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES public."ExamPaper"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Question Question_questionBankId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES public."QuestionBank"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServiceTicket ServiceTicket_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceTicket"
    ADD CONSTRAINT "ServiceTicket_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceTicket ServiceTicket_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceTicket"
    ADD CONSTRAINT "ServiceTicket_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopExecution SopExecution_campusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopExecution"
    ADD CONSTRAINT "SopExecution_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES public."Campus"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopExecution SopExecution_sopTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopExecution"
    ADD CONSTRAINT "SopExecution_sopTemplateId_fkey" FOREIGN KEY ("sopTemplateId") REFERENCES public."SopTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopInspection SopInspection_inspectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopInspection"
    ADD CONSTRAINT "SopInspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopInspection SopInspection_sopExecutionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopInspection"
    ADD CONSTRAINT "SopInspection_sopExecutionId_fkey" FOREIGN KEY ("sopExecutionId") REFERENCES public."SopExecution"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SopInspection SopInspection_sopTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopInspection"
    ADD CONSTRAINT "SopInspection_sopTemplateId_fkey" FOREIGN KEY ("sopTemplateId") REFERENCES public."SopTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopStep SopStep_sopTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopStep"
    ADD CONSTRAINT "SopStep_sopTemplateId_fkey" FOREIGN KEY ("sopTemplateId") REFERENCES public."SopTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopTaskCheckIn SopTaskCheckIn_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopTaskCheckIn"
    ADD CONSTRAINT "SopTaskCheckIn_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."SopTask"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SopTaskCheckIn SopTaskCheckIn_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopTaskCheckIn"
    ADD CONSTRAINT "SopTaskCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopTask SopTask_campusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopTask"
    ADD CONSTRAINT "SopTask_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES public."Campus"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopTask SopTask_sopExecutionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopTask"
    ADD CONSTRAINT "SopTask_sopExecutionId_fkey" FOREIGN KEY ("sopExecutionId") REFERENCES public."SopExecution"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SopTask SopTask_sopTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopTask"
    ADD CONSTRAINT "SopTask_sopTemplateId_fkey" FOREIGN KEY ("sopTemplateId") REFERENCES public."SopTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopWeeklyReport SopWeeklyReport_campusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopWeeklyReport"
    ADD CONSTRAINT "SopWeeklyReport_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES public."Campus"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopWeeklyReport SopWeeklyReport_reporterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopWeeklyReport"
    ADD CONSTRAINT "SopWeeklyReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SopWeeklyReport SopWeeklyReport_sopExecutionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopWeeklyReport"
    ADD CONSTRAINT "SopWeeklyReport_sopExecutionId_fkey" FOREIGN KEY ("sopExecutionId") REFERENCES public."SopExecution"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SopWeeklyReport SopWeeklyReport_sopTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SopWeeklyReport"
    ADD CONSTRAINT "SopWeeklyReport_sopTemplateId_fkey" FOREIGN KEY ("sopTemplateId") REFERENCES public."SopTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentClass StudentClass_academicOwnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentClass"
    ADD CONSTRAINT "StudentClass_academicOwnerId_fkey" FOREIGN KEY ("academicOwnerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StudentClass StudentClass_campusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentClass"
    ADD CONSTRAINT "StudentClass_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES public."Campus"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentClass StudentClass_lecturerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentClass"
    ADD CONSTRAINT "StudentClass_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StudentReminder StudentReminder_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentReminder"
    ADD CONSTRAINT "StudentReminder_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."StudentClass"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StudentReminder StudentReminder_courseSessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentReminder"
    ADD CONSTRAINT "StudentReminder_courseSessionId_fkey" FOREIGN KEY ("courseSessionId") REFERENCES public."CourseSession"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StudentReminder StudentReminder_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentReminder"
    ADD CONSTRAINT "StudentReminder_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StudentReminder StudentReminder_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentReminder"
    ADD CONSTRAINT "StudentReminder_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_academicOwnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_academicOwnerId_fkey" FOREIGN KEY ("academicOwnerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_campusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES public."Campus"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Student Student_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."StudentClass"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_salesOwnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_salesOwnerId_fkey" FOREIGN KEY ("salesOwnerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StudyPlan StudyPlan_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudyPlan"
    ADD CONSTRAINT "StudyPlan_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeachingContentExport TeachingContentExport_contentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentExport"
    ADD CONSTRAINT "TeachingContentExport_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES public."TeachingContent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeachingContentPublication TeachingContentPublication_campusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentPublication"
    ADD CONSTRAINT "TeachingContentPublication_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES public."Campus"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeachingContentPublication TeachingContentPublication_contentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentPublication"
    ADD CONSTRAINT "TeachingContentPublication_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES public."TeachingContent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeachingContentReview TeachingContentReview_contentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentReview"
    ADD CONSTRAINT "TeachingContentReview_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES public."TeachingContent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeachingContentReview TeachingContentReview_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentReview"
    ADD CONSTRAINT "TeachingContentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeachingContentVersion TeachingContentVersion_contentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContentVersion"
    ADD CONSTRAINT "TeachingContentVersion_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES public."TeachingContent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeachingContent TeachingContent_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeachingContent"
    ADD CONSTRAINT "TeachingContent_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserPermission UserPermission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPermission"
    ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_campusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES public."Campus"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WrongQuestionRecord WrongQuestionRecord_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WrongQuestionRecord"
    ADD CONSTRAINT "WrongQuestionRecord_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WrongQuestionRecord WrongQuestionRecord_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WrongQuestionRecord"
    ADD CONSTRAINT "WrongQuestionRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict XX7U2ULyeHhJ3t2Zexs1T8oQZyFM4WLzoFnRbrChmkIIrH1nxrr1mJyeWOuLj0c

