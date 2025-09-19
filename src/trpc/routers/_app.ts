// استيراد Zod للتحقق من صحة البيانات (data validation)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {  z } from 'zod';
// استيراد الإجراء الأساسي ودالة إنشاء الراوتر من ملف التهيئة
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';

// إنشاء راوتر التطبيق الرئيسي باستخدام createTRPCRouter
export const appRouter = createTRPCRouter({

  invoke:baseProcedure
  .input(
    z.object({
      text:z.string(),
    })

  ).mutation(async({input})=>{
    await inngest.send({
      name:"test/hello.world",
      data:{
        email:input.text
      }
    })


  }),
  // تعريف إجراء (endpoint) باسم "hello"
  hello: baseProcedure
    // تعريف شكل البيانات المدخلة (input validation) باستخدام Zod
    .input(
      z.object({
        text: z.string(), // حقل نصي مطلوب
      }),
    )
    // تعريف query (طلب للحصول على بيانات - يشبه GET request)
    .query((opts) => {
      // opts تحتوي على:
      // - input: البيانات المدخلة بعد التحقق من صحتها
      // - ctx: السياق (من createTRPCContext) مثل بيانات المستخدم
      
      return {
        greeting: `hello ${opts.input.text}`, // إرجاع رسالة ترحيب
      };
    }),
    
  // يمكن إضافة المزيد من الإجراءات هنا:
  // getUser: baseProcedure.input(...).query(...),
  // createUser: baseProcedure.input(...).mutation(...),
});

// تصدير نوع TypeScript للراوتر لاستخدامه على جانب العميل
// هذا يسمح لـ TypeScript بفحص أنواع البيانات تلقائياً بين الخادم والعميل
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
    // استعلام للحصول على user by ID
    getById: baseProcedure
      .input(z.object({ id: z.string() }))
      .query(async (opts) => {
        // محاكاة جلب user من database
        return { 
          user: { 
            id: opts.input.id, 
            name: 'John Doe',
            email: 'john@example.com'
          } 
        };
      }),
      
    // طفرة لإنشاء user جديد
    create: baseProcedure
      .input(z.object({ 
        name: z.string().min(2), 
        email: z.string().email() 
      }))
      .mutation(async (opts) => {
        // محاكاة إنشاء user في database
        return { 
          success: true, 
          userId: 'user_123',
          message: 'User created successfully'
        };
      }),
  }),
});
*/

// ⚡ الاستخدام على العميل:

/*
import { trpc } from './trpc-client';

// استدعاء query
const { data, isLoading } = trpc.hello.useQuery({ text: 'world' });
console.log(data?.greeting); // "hello world"

// استدعاء mutation
const mutation = trpc.user.create.useMutation();
mutation.mutate({ 
  name: 'John', 
  email: 'john@example.com' 
});
*/

// 🛡️ فوائد استخدام Zod:
// - التحقق من صحة البيانات تلقائياً على الخادم والعميل
// - أنواع TypeScript مولدة تلقائياً
// - منع هجمات injection وتحسين الأمان
// - رسائل خطأ واضحة للبيانات غير الصالحة

// 🔄 التوسيع المستقبلي:

// 1. إضافة middleware للمصادقة:
/*
export const authenticatedProcedure = baseProcedure.use((opts) => {
  if (!opts.ctx.userId) {
    throw new Error('غير مصرح بالدخول');
  }
  return opts.next();
});
*/

// 2. تقسيم الراوتر إلى ملفات متعددة:
/*
// في routers/user.ts
export const userRouter = createTRPCRouter({ ... });

// في routers/_app.ts
import { userRouter } from './user';
export const appRouter = createTRPCRouter({
  user: userRouter,
});
*/

// 3. دعم أنواع بيانات معقدة عبر superjson

// 💡 نصائح:
// 1. استخدم أسماء وصفيّة للإجراءات (getUserById بدلاً من getUser)
// 2. حدد تحقق صارم للبيانات المدخلة باستخدام Zod
// 3. قسم الراوتر إلى وحدات لمنع تضخم الملف
// 4. استخدم الأخطاء الوصفية للبيانات غير الصالحة

// 🌐 مثال على الطلبات:

// GET request للاستعلام:
// /api/trpc/hello?input={"text":"world"}

// POST request للطفرة:
// POST /api/trpc/user.create
// Body: {"name":"John","email":"john@example.com"}

// ✅ المخرجات المتوقعة:
// { success: true, userId: "user_123", message: "User created successfully" }