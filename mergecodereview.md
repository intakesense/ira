Code Review Results
Here's a summary of the findings:

CRITICAL Issues (Must Fix)
#	Issue	Location
1	No authentication on chat/document API routes - Anyone can read/send messages and upload/delete documents	api/chat/*, api/documents/*
2	No try/catch in send-otp + OTP rotation doesn't invalidate old OTPs	api/client-portal/send-otp/route.ts
3	Schema drift - page.tsx queries fields that may not exist in DB	prisma/schema.prisma, page.tsx
HIGH Severity Issues
#	Issue	Location
4	pusherClient at module level breaks SSR - split into separate files	lib/pusher.ts
5	leadDbId prop declared but never used	components/lead-chat.tsx:14-20
6	Mutations use API routes instead of Server Actions (violates CLAUDE.md)	api/chat/send, api/documents/*
7	Chat logic duplicated between ClientDashboard.tsx and lead-chat.tsx	Both files
MEDIUM Severity Issues
#	Issue	Location
8	No rate limiting on OTP send	api/client-portal/send-otp/route.ts
9	verify-otp doesn't re-check lead COMPLETED status	api/client-portal/verify-otp/route.ts
10	Inline styles instead of Tailwind	ClientDashboard.tsx
11	Wrong field shown as advisor name (reviewerName vs assignedAssessor.name)	ClientDashboard.tsx:1747
12	17 legacy preset columns remain in schema	prisma/schema.prisma:236-263
Would you like me to fix these issues? I can start with the critical ones:

Add authentication to the API routes
Add error handling to send-otp
Fix the advisor name bug (quick fix)
Remove unused leadDbId prop
