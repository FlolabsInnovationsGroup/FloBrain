# FloBrain — إصلاح تسجيل الدخول والشات

ملف تسليم للي هيكمل الشغل. فيه المشكلة، السبب، التعديل، إزاي تشغّل محليًا، وإزاي تنشر عشان الأونلاين يتصلح.

**الحالة دلوقتي**

| المكان | تسجيل الدخول | الشات |
|---|---|---|
| الكود المحلي (بعد التعديلات دي) | تمام | تمام |
| `www.flobrain.ai` / `api.flobrain.ai` | لسه النسخة القديمة | لسه بيرد رد وهمي |

الأونلاين **مش هيتصلح** غير بعد deploy للفرونت والباك مع المتغيرات تحت.

---

## 1) مشكلة تسجيل الدخول

### العرض

الموقع يظهر:

`Couldn't connect to FloBrain`

وكأنه الباك واقع. محليًا كان الدخول يشتغل، أونلاين لأ.

### الحقيقة

الباك **شغال**.

- `https://api.flobrain.ai/` → 200
- `https://api.flobrain.ai/api/dashboard/health/` → الداتابيز `connected`
- CORS من `www.flobrain.ai` شغال
- `POST /api/auth/signin/` من المتصفح بـ `fetch` بيرجع `401 Invalid credentials` صح

الفرونت المنشور فيه `NEXT_PUBLIC_API_URL=https://api.flobrain.ai/` متعمل bake وقت الـ build. يعني الرابط صح.

### السبب

في `flobrain-website/src/lib/axios.ts` أي رد `401` كان بيتتعامل كأنه access token وقع.

التسلسل:

1. اليوزر يضغط Sign In بحساب غلط أو حساب مش موجود أونلاين
2. الباك يرجع `401 Invalid credentials`
3. Axios interceptor يحاول يعمل refresh
4. مفيش refresh token → بيرمي `No refresh token`
5. طبقة الخطأ بتترجم أي Error من غير `response` لـ **Couldn't connect to FloBrain**

محليًا كان غالبًا الحساب موجود في الداتابيز المحلية (بيرجع 200) فالإinterceptor مش بيتفعل.

### الحل (اتعمل في الكود)

الملف: `flobrain-website/src/lib/axios.ts`

1. متتعملش refresh على:
   - `/api/auth/signin/`
   - `/api/auth/register/`
   - `/api/auth/refresh/`
2. لو مفيش refresh token في `localStorage` ارجع الـ 401 الأصلي
3. لو الـ refresh نفسه فشل، ارجع الـ 401 الأصلي مش `No refresh token`

بعد الإصلاح: تسجيل دخول غلط يظهر **Invalid credentials** مش رسالة الكونكت.

تستات: `flobrain-website/src/lib/axios.interceptor.test.ts`

```bash
cd flobrain-website
npm test -- src/lib/axios.interceptor.test.ts src/lib/api.normalizeError.test.ts
```

المفروض 6 تستات تعدي.

---

## 2) مشكلة الشات

### العرض

الشات أونلاين بيرد رد ثابت مش AI حقيقي.

### الحقيقة

تجربة مباشرة على البرودكشن:

```text
POST https://api.flobrain.ai/api/auth/register/     → 201
POST https://api.flobrain.ai/api/brain/chats/       → 201
POST https://api.flobrain.ai/api/brain/chats/<id>/send/
```

الرد من المساعد كان:

```text
I received your message: "...". This is a placeholder response. Connect an LLM for real replies.
```

الجملة دي **مش موجودة في الكود الحالي**. يعني سيرفر `api.flobrain.ai` لسه شغال على **نسخة قديمة** فيها stub.

الكود الحالي في الريبو بيبعت على خدمة multimodal:

`POST {MULTIMODAL_SERVICE_URL}/process`

الخدمة نفسها شغالة:

`http://35.153.90.219:8000/process` → رد حقيقي (مثلًا `Hello.` / `Hi!`)

### ليه الـ env مكانتش بتتقري صح

Django كان بيعمل `load_dotenv()` من غير مسار. بيدور على `.env` من مجلد التشغيل الحالي، مش من مجلد الباك ثابت.

`MULTIMODAL_SERVICE_URL` مكانتش متعرّفة في `settings.py`. الأدابتر كان بيحاول يقراها بـ `getattr(settings, ...)` وبعدين `os.environ`. لو الملف مش متحمّل أو السيرفر من غير المتغير، الشات يقع أو يفضل على الـ stub القديم.

### متغيرات الناس بتحطها ومتتتقريش

الباك Django **ما بيستخدمش** دول في الشات:

| المتغير | بيتقري؟ |
|---|---|
| `LLM_PROVIDER` | لا |
| `LLM_DEFAULT_MODEL` | لا |
| `OPENAI_API_KEY` | لا في `flobrain-core` |
| `ANTHROPIC_API_KEY` | لا |
| `INTERNAL_API_KEY` | لا |
| `NEXT_PUBLIC_API_URL` | لا — ده فرونت بس |

الشات دايمًا بيستخدم `MultimodalLLMAdapter` من:

`flobrain-core/backend/brain/llm/__init__.py`

مفتاح OpenAI لو محتاج يتحط على **سيرفر الـ multimodal** (`35.153.90.219`) مش في ملف Django.

`NEXT_PUBLIC_*` تتحط في **Vercel** (وقت الـ build) أو في `flobrain-website/.env.local`. لو اتحطت في `.env` بتاع الباك الفرونت مش هيشوفها.

### الحل (اتعمل في الكود)

الملف: `flobrain-core/backend/flobrain/settings.py`

1. تحميل `.env` من مسار ثابت:

```python
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
```

2. تعريف إعدادات الـ LLM:

```python
MULTIMODAL_SERVICE_URL = os.environ.get(
    "MULTIMODAL_SERVICE_URL", "http://35.153.90.219:8000"
).rstrip("/")
MULTIMODAL_API_KEY = os.environ.get("MULTIMODAL_API_KEY", "")
MULTIMODAL_SERVICE_TIMEOUT = int(os.environ.get("MULTIMODAL_SERVICE_TIMEOUT", "60"))
```

3. تنظيف `CSRF_TRUSTED_ORIGINS` من القيم الفاضية
4. دعم `DB_ENGINE=sqlite` للتشغيل المحلي من غير Postgres

تعديل إضافي عشان الباك يقدر يقلع محليًا من غير `chromadb`:

`flobrain-core/backend/memory/views.py`  
استيراد `tier_1` / `tier_2` / `tier_3` بقى جوه `MemorySaveView.post` مش على مستوى الملف. الشات مش محتاج chromadb.

بعد الربط محليًا، رسالة «Say hi in one short word.» رجّعت **Hi!** من خدمة الـ LLM.

---

## 3) الملفات اللي اتغيرت

| ملف | ليه |
|---|---|
| `flobrain-website/src/lib/axios.ts` | إصلاح الـ 401 interceptor |
| `flobrain-website/src/lib/axios.interceptor.test.ts` | تستات للـ interceptor |
| `flobrain-core/backend/flobrain/settings.py` | قراءة `.env` + `MULTIMODAL_*` + sqlite اختياري |
| `flobrain-core/backend/memory/views.py` | استيراد ثقيل متأجل عشان الباك يقلع |

ملفات محلية (متتتعملش commit — فيها إعدادات تشغيل):

| ملف | المحتوى |
|---|---|
| `flobrain-website/.env.local` | `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` |
| `flobrain-core/backend/.env` | شوف القسم 4 |

---

## 4) تشغيل المشروع محليًا (نفس اللي اتعمل)

### باك — Django

من `flobrain-core/backend` اعمل ملف `.env`:

```env
DEBUG=True
DB_ENGINE=sqlite
SECRET_KEY=django-local-chat-dev
ALLOWED_HOSTS=localhost,127.0.0.1
MULTIMODAL_SERVICE_URL=http://35.153.90.219:8000
MULTIMODAL_API_KEY=
```

بعدين:

```bash
cd flobrain-core/backend
python -m venv .venv
.\.venv\Scripts\activate
pip install "Django>=5.2,<6.0" django-cors-headers djangorestframework djangorestframework-simplejwt drf-spectacular PyJWT python-dotenv pymongo numpy
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

في الإنتاج الحقيقي استخدم Postgres (`DB_ENGINE` متعملهاش sqlite) و`pip install -r requirements.txt`.

تأكد:

```text
GET http://127.0.0.1:8000/api/dashboard/health/
```

المفروض `"database":"connected"`.

### فرونت — Next.js

من `flobrain-website` اعمل `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

```bash
cd flobrain-website
npm install
npm run dev
```

افتح `http://localhost:3000`.

مهم: `NEXT_PUBLIC_*` بتتقري وقت تشغيل/بناء Next. لو غيّرت `.env.local` لازم تعمل restart لـ `npm run dev`.

### تحقق من الشات

1. سجّل حساب جديد من `/register` أو:

```bash
# مثال
POST http://127.0.0.1:8000/api/auth/register/
{"name":"...","email":"...","password":"..."}
```

2. ادخل من `/signin`
3. روح `/brain` وابعت رسالة

المتوقع: رد حقيقي من الـ LLM، مش جملة الـ placeholder، ومش «Couldn't connect to FloBrain».

تسجيل دخول غلط: **Invalid credentials**.

---

## 5) اللي لازم يتعمل عشان الأونلاين يتصلح

الكود لوحده مش كفاية. السيرفرات المنشورة لسه قديمة.

### أ) Deploy الباك على `api.flobrain.ai`

انشر نفس كود `flobrain-core/backend` الحالي (اللي فيه `MULTIMODAL_*` في settings).

على سيرفر Django (systemd / Docker / panel) حط على الأقل:

```env
DEBUG=False
SECRET_KEY=<مفتاح قوي 32 بايت أو أكتر>
ALLOWED_HOSTS=api.flobrain.ai
CSRF_TRUSTED_ORIGINS=https://www.flobrain.ai,https://api.flobrain.ai
DB_NAME=...
DB_USER=...
DB_PASS=...
DB_HOST=...
DB_PORT=5432
MULTIMODAL_SERVICE_URL=http://35.153.90.219:8000
MULTIMODAL_API_KEY=
```

بعدها restart لعملية Django (gunicorn/uwsgi).

اتأكد إن سيرفر Django يقدر يوصل `http://35.153.90.219:8000` (Security Group / firewall). الخدمة HTTP مش HTTPS؛ الطلب server-to-server.

### ب) Deploy الفرونت على Vercel

في Vercel Environment Variables (Production + Preview):

```env
NEXT_PUBLIC_API_URL=https://api.flobrain.ai
```

من غير slash زيادة في الآخر أفضل (`https://api.flobrain.ai`). الكود بيمسح الـ slash لو موجودة.

بعد الحفظ: **Redeploy / Rebuild**. متغير `NEXT_PUBLIC_*` مش بيتحدث في الرن تايم؛ لازم build جديد.

### ج) تحقق بعد النشر

```text
GET  https://api.flobrain.ai/api/dashboard/health/
POST https://api.flobrain.ai/api/auth/signin/          → Invalid credentials لو الحساب غلط
POST https://api.flobrain.ai/api/brain/chats/<id>/send/ → رد LLM حقيقي مش placeholder
```

من `www.flobrain.ai/signin`: حساب غلط يظهر Invalid credentials. بعد دخول حقيقي، الشات يرد من الـ AI.

لو لسه شفت جملة `Connect an LLM for real replies` فـ deploy الباك **ما اتعملش** أو السيرفر لسه بيشغّل المجلد القديم.

---

## 6) ملاحظات مهمة للي هيكمل

- متخلطش env الفرونت والباك في ملف واحد.
- فورم الكونتاكت في الفرونت حاليًا بيعمل `setTimeout` ومش بيبعت `/api/contact/`. ده مش جزء من إصلاح الشات/اللوجين.
- لو اتعرض مفتاح OpenAI في شات أو تذكرة، اعمله rotate من لوحة OpenAI.
- `SECRET_KEY` المحلي القصير بيطلع warning من JWT؛ في الإنتاج استخدم مفتاح طويل.
- مفيش CI بينشر `flobrain-core` على `api.flobrain.ai`. النشر يدوي. الفرونت بيتنشر عن طريق Vercel / GitHub Actions.

---

## 7) ملخص سريع

1. الباك أونلاين مكانش واقع. الفرونت كان بيبَلع `401` ويظهر «Couldn't connect».
2. الشات أونلاين كان stub قديم + `MULTIMODAL_SERVICE_URL` مش متعرّفة في Django settings.
3. اتصلح في الكود. محليًا الشات بيرد من `35.153.90.219`.
4. الأونلاين يتصلح بعد deploy الباك والفرونت + المتغيرات في القسم 5.
