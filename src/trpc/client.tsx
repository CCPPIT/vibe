'use client';
// ^-- هذا السطر يجعل المكون يعمل على جانب العميل (Client-Side)
//     حتى يمكن استخدامه من داخل مكونات الخادم (Server Components)

// استيراد الأنواع والوحدات الضرورية
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import superjson from 'superjson';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

// إنشاء سياق TRPC الذي يوفر وظائف tRPC للتطبيق
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// متغير لتخزين عميل الاستعلامات للمتصفح (يتم مشاركته بين جميع المكونات)
let browserQueryClient: QueryClient;

// دالة للحصول على عميل الاستعلامات المناسب (للخادم أو المتصفح)
function getQueryClient() {
  // إذا كنا على الخادم (أثناء التصيير من جانب الخادم - SSR)
  if (typeof window === 'undefined') {
    // الخادم: إنشاء عميل استعلامات جديد في كل مرة
    // هذا مهم لعزل البيانات بين المستخدمين والطلبات
    return makeQueryClient();
  }
  
  // المتصفح: إنشاء عميل استعلامات جديد فقط إذا لم يكن موجود بالفعل
  // هذا مهم جداً لتجنب إعادة إنشاء العميل إذا قام React بإيقاف التصيير مؤقتاً
  // (Suspense) خلال التصيير الأولي
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}


// دالة للحصول على URL الخاص بـ tRPC بناء على البيئة
function getUrl() {
  const base = (() => {
    // إذا كنا في المتصفح (جانب العميل)، استخدام المسار النسبي
    if (typeof window !== 'undefined') return '';
    return process.env.NEXT_PUBLIC_APP_URL;
    
    // إذا كنا على Vercel (جانب الخادم)، استخدام URL الخاص بـ Vercel
    // if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    
    // التطوير المحلي: استخدام localhost
    // return 'http://localhost:3000';
  })();

  // إرجاع URL كامل لنقطة نهاية tRPC
  return `${base}/api/trpc`;
}

// مكون موفر (Provider) لـ tRPC و React Query
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode; // الأطفال الذين سيتم تغطيتهم بالموفر
  }>,
) {
  // الحصول على عميل الاستعلامات المناسب
  // ملاحظة: تم تجنب useState هنا لتجنب مشاكل الإيقاف المؤقت في التصيير الأولي
  // لأن React قد يتخلص من العميل إذا تم إيقاف التصيير ولم يكن هناك حدود Suspense
  const queryClient = getQueryClient();

  // إنشاء عميل tRPC (يتم إنشاؤه مرة واحدة فقط بفضل useState)
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson, // محول البيانات المطابق للخادم
          url: getUrl(), // تعيين URL لنقطة نهاية tRPC
        }),
      ],
    }),
  );

  // إرجاع هيكل الموفرات المتداخلة
  return (
    /* موفر React Query لإدارة حالة الاستعلامات والتخزين المؤقت */
    <QueryClientProvider client={queryClient}>
      {/* موفر tRPC لتوفير عميل tRPC واستعلامات React Query */}
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children} {/* عرض الأطفال المعطيين */}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
  
// 📝 شرح المفاهيم الأساسية:

// 🏗️  البنية المتداخلة (Nested Providers):
// - QueryClientProvider: يوفر إدارة حالة لـ React Query
// - TRPCProvider: يوفر وظائف tRPC ويربطها مع React Query

// 🌐 إدارة الاتصال (Server vs Client):
// - الخادم: عميل جديد في كل طلب (لضمان عزل البيانات بين المستخدمين)
// - المتصفح: عميل واحد مشترك (لتحسين الأداء وإعادة استخدام الاتصال)

// 🔗 روابط tRPC (Links):
// - httpBatchLink: يسمح بجمع عدة طلبات في طلب HTTP واحد (Batch)
// - يحسن الأداء عن طريق تقليل عدد الطلبات الشبكية

// ⚡ تحسين الأداء:
// - المشاركة الفردية لعميل الاستعلامات في المتصفح
// - تجميع الطلبات باستخدام httpBatchLink
// - تجنب إعادة إنشاء العملاء غير الضرورية

// 🛡️ أمان البيانات:
// - العزل التام بين عملاء الخادم (منع تسرب بيانات بين المستخدمين)
// - إدارة منفصلة للحالة على الخادم والعميل

// 🔄 دورة الحياة:
// 1. الخادم: عميل جديد لكل طلب → عزل تام
// 2. العميل: عميل مشترك → أداء أفضل
// 3. التهيئة: مرة واحدة عند التحميل


// 🎯 استخدام هذا الموزع:
// 1. يلف تطبيقك في المكون الجذر (Root Layout)
// 2. يوفر وصولاً إلى tRPC و React Query في جميع المكونات
// 3. يدعم التصيير من جانب الخادم والعميل

// ⚠️ ملاحظات مهمة:
// - التأكد من تطابق URL بين الخادم والعميل
// - إضافة حدود Suspense عند الحاجة لمنع مشاكل التصيير

// 💡 مثال الاستخدام في layout.tsx:
/*
import { TRPCReactProvider } from './trpc-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
*/

// 🚀 مثال الاستخدام في المكونات:
/*
import { useTRPC } from './trpc-provider';

function MyComponent() {
  const { trpc } = useTRPC();
  
  // استخدام الاستعلامات
  const { data } = trpc.user.getById.useQuery({ id: '123' });
  
  // استخدام الطفرات
  const mutation = trpc.user.create.useMutation();
  
  return <div>{data?.name}</div>;
}
*/
