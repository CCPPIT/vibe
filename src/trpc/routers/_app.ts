// استيراد Zod للتحقق من صحة البيانات (data validation)
import { z } from 'zod';
// استيراد الإجراء الأساسي ودالة إنشاء الراوتر من ملف التهيئة
import { baseProcedure, createTRPCRouter } from '../init';

// إنشاء راوتر التطبيق الرئيسي باستخدام createTRPCRouter
export const appRouter = createTRPCRouter({
  // تعريف إجراء (endpoint) باسم "hello"
  hello: baseProcedure
    // تعريف شكل البيانات المدخلة (input validation) باستخدام Zod
    .input(
      z.object({
        text: z.string(), // حقل نصي مطلوب
      }),
    )
    // تعريف query (طلب للحصول على بيانات)
    .query((opts) => {
      // opts تحتوي على:
      // - input: البيانات المدخلة بعد التحقق من صحتها
      // - ctx: السياق (من createTRPCContext)
      
      return {
        greeting: `hello ${opts.input.text}`, // إرجاع رسالة ترحيب
      };
    }),
    
  // يمكن إضافة المزيد من الإجراءات هنا:
  // getUser: baseProcedure.input(...).query(...),
  // createUser: baseProcedure.input(...).mutation(...),
});

// تصدير نوع TypeScript للراوتر لاستخدامه على جانب العميل
// هذا يسمح لـ TypeScript بفحص أنواع البيانات تلقائياً
export type AppRouter = typeof appRouter;

// 📝 شرح المفاهيم الأساسية:

// 🏗️ هيكل الراوتر:
// - appRouter: الراوتر الرئيسي الذي يجمع كل الإجراءات
// - يمكن تقسيمه إلى رواتر فرعية للتنظيم

// 🔍 Zod للتحقق من الصحة:
// - z.object(): تحدد شكل الكائن المتوقع
// - z.string(): تأكد أن الحقل نصي
// - يمكن إضافة: .min(), .max(), .email(), etc.

// 📊 أنواع الإجراءات:
// - .query(): لطلبات GET (قراءة البيانات)
// - .mutation(): لطلبات POST/PUT/DELETE (تعديل البيانات)

// 🎯 مثال على توسيع الراوتر:

/*
export const appRouter = createTRPCRouter({
  user: createTRPCRouter({
    get: baseProcedure
      .input(z.object({ id: z.string() }))
      .query(async (opts) => {
        // جلب user من database
        return { user: { id: opts.input.id, name: 'John' } };
      }),
      
    create: baseProcedure
      .input(z.object({ name: z.string().min(2) }))
      .mutation(async (opts) => {
        // إنشاء user في database
        return { success: true, userId: '123' };
      }),
  }),
  
  post: createTRPCRouter({
    list: baseProcedure.query(async () => {
      // جلب قائمة posts
      return { posts: [] };
    }),
  }),
});
*/

// ⚡ الاستخدام على العميل:

/*
import { trpc } from './trpc-client';

// استدعاء query
const { data } = trpc.hello.useQuery({ text: 'world' });
console.log(data.greeting); // "hello world"

// استدعاء mutation
const mutation = trpc.user.create.useMutation();
mutation.mutate({ name: 'John' });
*/

// 🛡️ فوائد استخدام Zod:
// - التحقق من صحة البيانات تلقائياً
// - أنواع TypeScript مولدة تلقائياً
// - منع هجمات injection وتحسين الأمان

// 🔄 التوسيع المستقبلي:
// - يمكن إضافة middleware للمصادقة
// - يمكن تقسيم الراوتر إلى ملفات متعددة
// - دعم أنواع بيانات معقدة عبر superjson

// 💡 نصائح:
// 1. استخدم أسماء وصفيّة للإجراءات
// 2. حدد تحقق صارم للبيانات المدخلة
// 3. قسم الراوتر إلى وحدات لمنع التضخم