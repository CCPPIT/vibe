// معالج طلبات tRPC لبيئة Next.js مع App Router
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';

// دالة معالجة الطلبات لـ tRPC
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc', // نقطة النهاية لـ tRPC
    req, // كائن الطلب (Request)
    router: appRouter, // الراوتر الرئيسي للتطبيق
    createContext: createTRPCContext, // دالة إنشاء السياق
  });

// تصدير المعالج كدوال GET و POST لـ Next.js Route Handler
export { handler as GET, handler as POST };

// 📝 شرح المفاهيم الأساسية:

// 🎯 الغرض من هذا الملف:
// - إنشاء معالج API routes لـ tRPC في Next.js
// - التعامل مع طلبات HTTP للاستعلامات والطفرات
// - ربط tRPC مع Next.js App Router

// 🔧 مكونات fetchRequestHandler:

// 1. endpoint: '/api/trpc'
//    - المسار الذي ستُخدم منه API tRPC
//    - يجب أن يتطابق مع المسار المستخدم على العميل

// 2. req: Request
//    - كطلب HTTP الوارد من العميل
//    - يحتوي على URL، headers، body، etc.

// 3. router: appRouter
//    - الراوتر الرئيسي الذي يحتوي على جميع الإجراءات
//    - يتم استيراده من ~/trpc/routers/_app

// 4. createContext: createTRPCContext
//    - دالة تنشئ السياق لكل طلب
//    - تحتوي على بيانات مثل المستخدم المصادق عليه، قواعد البيانات، etc.

// 🌐 كيفية العمل:

// 1. يرسل العميل طلباً إلى /api/trpc/hello
// 2. Next.js يوجه الطلب إلى هذا المعالج
// 3. fetchRequestHandler تعالج الطلب
// 4. createTRPCContext تنشئ السياق
// 5. appRouter تنفذ الإجراء المناسب
// 6. ترجع النتيجة إلى العميل

// 📡 دعم methods:
// - GET: للاستعلامات (queries) - عادة لقراءة البيانات
// - POST: للطفرات (mutations) - عادة لكتابة البيانات

// 🎪 مثال على الطلبات:

// GET request:
// /api/trpc/hello?input={"text":"world"}

// POST request:
// POST /api/trpc/hello
// Body: {"text":"world"}

// 🔒 الأمان:
// - كل طلب يحصل على سياق منفصل
// - العزل التام بين المستخدمين
// - التحقق من الصحة التلقائي عبر Zod

// ⚡ المميزات:
// - متوافق مع Fetch API
// - يدعم التدفق (streaming)
// - خفيف الوزن وسريع

// 💡 نصائح مهمة:

// 1. الموقع النموذجي لهذا الملف:
//    app/api/trpc/route.ts

// 2. التأكد من تطابق المسارات:
//    - العميل: /api/trpc
//    - الخادم: /api/trpc

// 3. يمكن إضافة middleware إضافية:
/*
const handler = (req: Request) => {
  // إضافة middleware للتحقق من المصادقة
  if (!isAuthenticated(req)) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  return fetchRequestHandler({ ... });
}
*/

// 4. دعم CORS إذا لزم الأمر:
/*
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
*/

// 🚀 الاستخدام في Next.js:
// - هذا الملف يجب أن يكون في app/api/trpc/route.ts
// - Next.js يتعامل معه تلقائياً كـ Route Handler
// - يدعم كل من App Router و Pages Router