// استيراد الوحدات الضرورية من trpc/server
import { initTRPC } from '@trpc/server';
// استيراد دالة cache من React للخادم
import { cache } from 'react';
// استيراد مكتبة superjson لتحويل البيانات
import superjson from 'superjson';

// دالة لإنشاء سياق tRPC مع التخزين المؤقت خلال نفس الطلب
export const createTRPCContext = cache(async () => {
  /**
   * السياق (Context) في tRPC:
   * - يحتوي على بيانات متاحة لجميع الإجراءات (procedures)
   * - مثل بيانات المصادقة، قاعدة البيانات، etc.
   * @see: https://trpc.io/docs/server/context
   */
  return { 
    userId: 'user_123' // ⚠️ هذا مثال، في التطبيق الحقيقي يجب إضافة المصادقة الحقيقية
  };
});

// تجنب تصدير كائن t بالكامل
// لأنه ليس وصفيًا بما فيه الكفاية.
// على سبيل المثال، استخدام متغير t شائع في مكتبات i18n.

// تهيئة tRPC مع الإعدادات الأساسية
const t = initTRPC.create({
  /**
   * محول البيانات (transformer):
   * - superjson يدعم أنواع البيانات المعقدة مثل Date، Map، Set
   * - يحافظ على أنواع البيانات أثناء الإرسال بين الخادم والعميل
   * @see https://trpc.io/docs/server/data-transformers
   */
   transformer: superjson, // استخدام superjson لتحويل البيانات
});

// تصدير مساعدات الراوتر والإجراءات الأساسية

// مساعد لإنشاء راوتر tRPC
export const createTRPCRouter = t.router;

// مساعد لإنشاء caller (مستدعي) للراوتر
export const createCallerFactory = t.createCallerFactory;

// الإجراء الأساسي الذي يمكن توسيعه بالإجراءات الأخرى (middleware)
export const baseProcedure = t.procedure;

// 📝 شرح المفاهيم الأساسية:

// 🏗️ الهيكل الأساسي لـ tRPC:

// 1. السياق (Context):
//    - بيانات متاحة لجميع الإجراءات
//    - يتم إنشاؤه مرة واحدة لكل طلب بفضل cache
//    - يمكن إضافة: مصادقة، قواعد بيانات، خدمات، etc.

// 2. المحول (Transformer):
//    - superjson: يحول البيانات بشكل ذكي بين الخادم والعميل
//    - يدعم أنواع JavaScript المعقدة التي لا يدعمها JSON العادي

// 3. الإجراءات (Procedures):
//    - baseProcedure: الإجراء الأساسي الذي يمكن توسعته
//    - يمكن إضافة: مصادقة، تحقق من الصحة، تحويل البيانات، etc.

// 4. الراوتر (Router):
//    - يجمع الإجراءات في هيكل شجري
//    - ينظم API بطريقة modular

// 🎯 مثال على التوسيع:

// import { baseProcedure } from './trpc';
// export const authenticatedProcedure = baseProcedure.use((opts) => {
//   // التحقق من المصادقة هنا
//   if (!opts.ctx.userId) {
//     throw new Error('غير مصرح بالدخول');
//   }
//   return opts.next();
// });

// ⚠️ ملاحظات مهمة:

// - cache: يضمن أن السياق يُنشأ مرة واحدة فقط خلال نفس الطلب
// - userId: في التطبيق الحقيقي، يجب الحصول عليه من المصادقة (مثل JWT)
// - baseProcedure: هو نقطة البداية لإنشاء إجراءات مخصصة

// 🔧 الاستخدام المتوقع:

// 1. إنشاء راوتر:
// const appRouter = createTRPCRouter({ ... });

// 2. إنشاء caller:
// const caller = createCallerFactory(appRouter)(createTRPCContext);

// 3. استدعاء الإجراءات:
// const result = await caller.user.getById({ id: '123' });