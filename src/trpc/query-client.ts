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
        // ✅ تم تعليق serializeData لوجود مشكلة محتملة
        // serializeData: superjson.serialize, // استخدام superjson لتسييل البيانات
        
        // الدالة التي تحدد إذا كان يجب تجفيف الاستعلام أم لا
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || // الشرط الافتراضي للتجفيف
          query.state.status === 'pending', // || تجفيف الاستعلامات التي لا تزال قيد التنفيذ (pending)
      },
      // إعدادات عملية إعادة التمييه (Hydration) - لاسترجاع البيانات المجففة
      hydrate: {
        // ✅ تم تعليق deserializeData لوجود مشكلة محتملة  
        // deserializeData: superjson.deserialize, // استخدام superjson لإعادة تحويل البيانات
      },
    },
  });
}

// 📝 شرح المشكلة المحتملة:

// ❌ سبب التعليق على superjson:
// - هناك مشكلة معروفة في تكامل superjson مع الإصدارات الحديثة
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

// 2. استخدام محول بيانات آخر:
/*
import { dehydrate } from '@tanstack/react-query';
dehydrate: {
  serializeData: (data) => JSON.parse(JSON.stringify(data)),
},
*/

// 🎯 الغرض من الإعدادات:

// 1. staleTime: 30 * 1000 (30 ثانية)
//    - تحسين الأداء بتقليل طلبات الشبكة المتكررة
//    - الحفاظ على البيانات "طازجة" لمدة 30 ثانية

// 2. تجفيف الاستعلامات pending:
//    - مهم لتحسين تجربة SSR
//    - يسمح باستكمال الاستعلامات على العميل
//    - يمنع إعادة fetch غير الضرورية

// ⚠️ المشاكل المحتملة:

// 1. بدون superjson:
//    - فقدان أنواع البيانات المعقدة (Date, Map, Set, etc.)
//    - تحتاج إلى معالجة يدوية للأنواع

// 2. مع superjson (معلق حالياً):
//    - مشاكل في التوافق مع الإصدارات
//    - أخطاء في عملية التسييل

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

// الحل الثاني: تنفيذ محول بيانات مخصص
/*
dehydrate: {
  serializeData: customSerializer,
  shouldDehydrateQuery: (query) =>
    defaultShouldDehydrateQuery(query) ||
    query.state.status === 'pending',
},
hydrate: {
  deserializeData: customDeserializer,
}
*/

// 🔧 الاستخدام المتوقع:
// يتم استدعاء هذه الدالة في:
// - الخادم: لكل طلب (لضمان العزل)
// - العميل: مرة واحدة (للمشاركة بين المكونات)

// 📦 مثال الاستخدام:
/*
import { makeQueryClient } from './query-client';

// على الخادم (في كل طلب)
const queryClient = makeQueryClient();

// على العميل (مرة واحدة)
const [queryClient] = useState(() => makeQueryClient());
*/