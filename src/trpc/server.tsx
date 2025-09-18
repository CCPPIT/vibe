// تأكد أن هذا الملف لا يمكن استيراده من جانب العميل (Client-Side)
import 'server-only';

// استيراد الدوال والوحدات الضرورية
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import { createTRPCClient, httpLink } from '@trpc/client';

// مهم: إنشاء getter مستقر لعميل الاستعلامات
// الذي سيعيد نفس العميل خلال نفس الطلب (Request)
export const getQueryClient = cache(makeQueryClient);

// إنشاء وكيل (proxy) خيارات tRPC للاستخدام على الخادم
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,      // دالة لإنشاء سياق tRPC
  router: appRouter,           // الراوتر الرئيسي للتطبيق
  queryClient: getQueryClient, // عميل الاستعلامات (يتم مشاركته خلال نفس الطلب)
});
export const caller=appRouter.createCaller(createTRPCContext)

// إذا كان الراوتر على خادم منفصل، يمكنك تمرير عميل مخصص:
// createTRPCOptionsProxy({
//   client: createTRPCClient({
//     links: [httpLink({ url: '...' })], // رابط HTTP للاتصال بالخادم البعيد
//   }),
//   queryClient: getQueryClient, // عميل الاستعلامات المشترك
// });

// 📝 شرح المفاهيم الأساسية:

// 🚫 'server-only':
// - يضمن أن هذا الملف لا يمكن استيراده من جانب العميل
// - يمنع تسرب شيفرة الخادم إلى المتصفح
// - يحسن أمان التطبيق

// 💾 cache من React:
// - يخزن النتيجة خلال نفس الطلب (Request)
// - يضمن أن كل طلب يحصل على نفس النسخة من عميل الاستعلامات
// - يحسن الأداء عن طريق منع إعادة الإنشاء غير الضرورية

// 🏗️ createTRPCOptionsProxy:
// - ينشئ وكيلاً (proxy) لخيارات tRPC
// - يسمح باستخدام tRPC على جانب الخادم
// - يوفر واجهة موحدة للاستعلامات والطفرات

// 🔗 الروابط (Links):
// - httpLink: رابط HTTP عادي للاتصال بالخادم
// - بديل عن httpBatchLink على الخادم حيث لا حاجة للتجميع

// 🌐 سيناريو الخادم المنفصل:
// - مفيد عندما يكون tRPC API على نطاق (domain) مختلف
// - مثال: API على api.example.com والتطبيق على example.com

// 🎯 فوائد هذا الإعداد:

// 1. الأداء:
//    - مشاركة عميل الاستعلامات خلال نفس الطلب
//    - تقليل تكرار إنشاء العملاء

// 2. الأمان:
//    - منع تسرب شيفرة الخادم إلى العميل
//    - عزل كامل بين الخادم والعميل

// 3. المرونة:
//    - دعم كل من الخادم المحلي والخوادم البعيدة
//    - واجهة موحدة للاستخدام

// 4. إدارة الحالة:
//    - سياق مخصص لكل طلب (Request)
//    - عزل البيانات بين المستخدمين

// ⚠️ ملاحظات مهمة:

// - هذا الملف للاستخدام على الخادم فقط (Server Components)
// - لا يمكن استخدامه في مكونات العميل (Client Components)
// - يتم إنشاء سياق منفصل لكل طلب لضمان العزل
// - عميل الاستعلامات يتم مشاركته خلال نفس الطلب فقط