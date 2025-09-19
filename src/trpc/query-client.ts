// استيراد الدوال والوحدات الضرورية من React Query وsuperjson
import {
  defaultShouldDehydrateQuery, // الدالة الافتراضية للتحقق من إمكانية تجفيف الاستعلام
  QueryClient, // العميل الرئيسي لإدارة استعلامات React Query
} from '@tanstack/react-query';
import superjson from 'superjson'; // مكتبة للتعامل مع التسييل (serialization) المتقدم

// دالة لإنشاء وتكوين عميل استعلامات مخصص
export function makeQueryClient() {
  // إعادة عميل استعلامات جديد مع إعدادات مخصصة
  return new QueryClient({
    // الإعدادات الافتراضية للعميل
    defaultOptions: {
      // إعدادات الاستعلامات (Queries)
      queries: {
        // وقت انتهاء صلاحية البيانات (بالميلي ثانية) - 30 ثانية
        // بعد هذه المدة تصبح البيانات "stale" وقد يتم إعادة fetch
        staleTime: 30 * 1000,
      },
      // إعدادات عملية التجفيف (Dehydration) - للتخزين المؤقت في SSR
      dehydrate: {
        // ✅ تم تعليق serializeData لوجود مشكلة محتملة في الإصدارات الحديثة
        // serializeData: superjson.serialize, // استخدام superjson لتسييل البيانات
        
        // الدالة التي تحدد إذا كان يجب تجفيف الاستعلام أم لا
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || // الشرط الافتراضي للتجفيف
          query.state.status === 'pending', // || تجفيف الاستعلامات التي لا تزال قيد التنفيذ (pending)
      },
      // إعدادات عملية إعادة التمييه (Hydration) - لاسترجاع البيانات المجففة
      hydrate: {
        // ✅ تم تعليق deserializeData لوجود مشكلة محتملة في الإصدارات الحديثة  
         deserializeData: superjson.deserialize, // استخدام superjson لإعادة تحويل البيانات
      },
    },
  });
}

// 📝 شرح المشكلة المحتملة:

// ❌ سبب التعليق على superjson:
// - هناك مشكلة معروفة في تكامل superjson مع الإصدارات الحديثة من React Query
// - قد تسبب أخطاء في التسييل أو إعادة التمييه
// - يتم البحث عن بديل أو إصلاح للمشكلة

// 🔄 البدائل المقترحة:

// 1. استخدام JSON العادي (مؤقتاً):
/*
dehydrate: {
  shouldDehydrateQuery: (query) =>
    defaultShouldDehydrateQuery(query) ||
    query.state.status === 'pending',
},
hydrate: {
  // لا حاجة لإعدادات إضافية
}
*/

// 2. استخدام محول بيانات مخصص:
/*
dehydrate: {
  serializeData: (data) => {
    // معالجة يدوية للأنواع المعقدة مثل Date
    return JSON.parse(JSON.stringify(data));
  },
},
hydrate: {
  deserializeData: (data) => {
    // معالجة يدوية لإعادة تحويل الأنواع
    return data;
  },
},
*/

// 🎯 الغرض من الإعدادات:

// 1. staleTime: 30 * 1000 (30 ثانية)
//    - تحسين الأداء بتقليل طلبات الشبكة المتكررة
//    - الحفاظ على البيانات "طازجة" لمدة 30 ثانية
//    - بعد 30 ثانية، تصبح البيانات "stale" وقد يتم إعادة fetch

// 2. تجفيف الاستعلامات pending:
//    - مهم لتحسين تجربة SSR (Server-Side Rendering)
//    - يسمح باستكمال الاستعلامات على العميل بعد التصيير من الخادم
//    - يمنع إعادة fetch غير الضرورية للبيانات التي كانت قيد التحميل

// ⚠️ المشاكل المحتملة:

// 1. بدون superjson:
//    - فقدان أنواع البيانات المعقدة (Date, Map, Set, etc.)
//    - تحتاج إلى معالجة يدوية للأنواع في التطبيق

// 2. مع superjson (معلق حالياً):
//    - مشاكل في التوافق مع الإصدارات الحديثة
//    - أخطاء في عملية التسييل/إعادة التمييه

// 💡 الحلول المقترحة:

// الحل الأول: الانتظار لتحديث المكتبات
/*
// عندما يتم إصلاح المشكلة:
dehydrate: {
  serializeData: superjson.serialize,
  shouldDehydrateQuery: (query) =>
    defaultShouldDehydrateQuery(query) ||
    query.state.status === 'pending',
},
hydrate: {
  deserializeData: superjson.deserialize,
}
*/

// الحل الثاني: استخدام إصدارات متوافقة
// - العودة إلى إصدارات سابقة من React Query أو superjson
// - البحث عن إصدارات معروفة بالاستقرار

// 🔧 الاستخدام المتوقع:
// يتم استدعاء هذه الدالة في:
// - الخادم: لكل طلب (لضمان العزل بين المستخدمين)
// - العميل: مرة واحدة (للمشاركة بين المكونات)

// 📦 مثال الاستخدام:
/*
// على الخادم (في كل طلب) - لمكونات Server Components
import { makeQueryClient } from './query-client';
const queryClient = makeQueryClient();

// على العميل (مرة واحدة) - في Provider
import { useState } from 'react';
import { makeQueryClient } from './query-client';
const [queryClient] = useState(() => makeQueryClient());
*/

// 🎯 فوائد هذا الإعداد:
// 1. تحسين أداء التطبيق بتقليل طلبات الشبكة غير الضرورية
// 2. دعم تجربة SSR بشكل أفضل باستكمال الاستعلامات على العميل
// 3. التحكم في مدة صلاحية البيانات للتحديث التلقائي
// 4. تحسين تجربة المستخدم بتقليل وقت التحميل

// ⚠️ تحذيرات:
// - التأكد من توافق الإصدارات قبل إعادة تمكين superjson
// - اختبار وظيفة التجفيف/إعادة التمييه بشكل شامل
// - مراقبة أداء التطبيق بعد التغييرات