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
export const caller = appRouter.createCaller(createTRPCContext);

// إذا كان الراوتر على خادم منفصل، يمكنك تمرير عميل مخصص:
/*
createTRPCOptionsProxy({
  client: createTRPCClient({
    links: [httpLink({ url: 'https://api.example.com' })], // رابط HTTP للاتصال بالخادم البعيد
  }),
  queryClient: getQueryClient, // عميل الاستعلامات المشترك
});
*/


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

// 🔧 مثال الاستخدام في Server Components:

/*
import { trpc } from '~/trpc/server';

export default async function ServerComponent() {
  // استخدام trpc على الخادم
  const user = await trpc.user.getById({ id: '123' });
  
  return (
    <div>
      <h1>{user.name}</h1>
    </div>
  );
}
*/

// 📊 الفرق بين الخادم والعميل:

// | الخادم (Server)          | العميل (Client)           |
// |--------------------------|---------------------------|
// | عميل استعلامات لكل طلب   | عميل استعلامات مشترك      |
// | سياق منفصل لكل مستخدم    | سياق مشترك                |
// | مناسب للبيانات الحساسة   | مناسب للبيانات العامة     |

// 🛡️ اعتبارات الأمان:

// 1. المصادقة على الخادم:
//    - يجب معالجة المصادقة في createTRPCContext
//    - التأكد من صلاحية tokens وجلسات المستخدمين

// 2. التحقق من الصحة:
//    - استخدام Zod للتحقق من صحة البيانات المدخلة
//    - منع هجمات injection

// 3. العزل:
//    - ضمان عزل البيانات بين المستخدمين
//    - منع تسرب البيانات الحساسة

// 💡 نصائح للاستخدام:

// 1. استخدم هذا للمكونات التي تحتاج بيانات من الخادم
// 2. استخدم العميل للمكونات التفاعلية
// 3. اجمع بين الاثنين لأفضل تجربة مستخدم

// - عميل الاستعلامات يتم مشاركته خلال نفس الطلب فقط

