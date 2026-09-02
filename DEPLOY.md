# نشر ورّاق على سيرفر داخلي (Node.js + PM2)

هذا الدليل يفترض سيرفر Linux (Ubuntu/Debian أو مشابه) عليه صلاحية SSH،
وأنك بتشغّل الموقع مباشرة بـ Node.js (بدون Docker).

## 1) المتطلبات على السيرفر

- **Node.js 20 أو أحدث** (المشروع مبني ويُختبر على Node 22).
  تحقق: `node -v`
  إذا ناقص، ثبّته عبر [nvm](https://github.com/nvm-sh/nvm) أو من مستودع التوزيعة.
- **npm** (يجي مع Node).
- **PM2** لإدارة العملية وإعادة التشغيل التلقائي:
  ```bash
  npm install -g pm2
  ```

## 2) نقل المشروع للسيرفر

من جهازك:

```bash
git clone <رابط-الريبو> warraq
# أو لو ماعندك git على السيرفر، ارفع المجلد بـ rsync/scp
```

أو داخل السيرفر مباشرة إذا عنده وصول للريبو:

```bash
git clone <رابط-الريبو> warraq
cd warraq
git checkout claude/greeting-session-tgmqnb   # أو main بعد الدمج
```

## 3) التثبيت والبناء

```bash
cd warraq
npm ci            # تثبيت الحزم (بما فيها devDependencies اللازمة للبناء)
npm run build     # بناء نسخة الإنتاج
```

تأكد ما فيه أخطاء أثناء `npm run build`. لو تبي تتأكد يدويًا قبل تشغيل PM2:

```bash
npm run start -- -p 3000
# افتح http://السيرفر:3000 وتحقق، ثم Ctrl+C
```

## 4) التشغيل الدائم بـ PM2

المشروع فيه ملف `ecosystem.config.js` جاهز (يشغّل على المنفذ 3000).
عدّل المنفذ داخل الملف إذا تحتاج غيره.

```bash
pm2 start ecosystem.config.js
pm2 save                # يحفظ القائمة الحالية
pm2 startup             # يطبع أمر لتفعيل PM2 تلقائيًا بعد ريستارت السيرفر، نفّذه كما يظهر لك
```

أوامر مفيدة بعدين:

```bash
pm2 status               # حالة العملية
pm2 logs warraq          # السجلات
pm2 restart warraq       # إعادة تشغيل بعد تحديث
pm2 stop warraq
```

## 5) (بديل) تشغيل عبر systemd بدل PM2

إذا تفضل systemd بدل PM2، أنشئ `/etc/systemd/system/warraq.service`:

```ini
[Unit]
Description=Warraq PDF Tools
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/warraq
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p 3000
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

ثم:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now warraq
sudo systemctl status warraq
```

## 6) ربطه بدومين داخلي عبر Nginx (اختياري لكن موصى به)

مثال إعداد Nginx كـ reverse proxy:

```nginx
server {
    listen 80;
    server_name warraq.internal.example;  # غيّره لدومينك الداخلي

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

فعّل الموقع وأعد تحميل Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/warraq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

> ملاحظة: الموقع بالكامل static/client-side لأدوات PDF (ما فيه قاعدة بيانات
> ولا رفع ملفات لسيرفر)، فما يحتاج أي إعدادات إضافية غير تشغيل Next.js
> نفسه خلف الـ proxy.

## 7) تحديث الموقع لاحقًا

```bash
cd warraq
git pull
npm ci
npm run build
pm2 restart warraq        # أو: sudo systemctl restart warraq
```

## استكشاف الأخطاء

- **المنفذ مستخدم:** غيّر `-p 3000` في `ecosystem.config.js` (أو أمر systemd) لمنفذ فاضي.
- **`npm run build` يفشل:** تأكد Node.js 20+، واحذف `node_modules` و`.next` وأعد `npm ci`.
- **الصفحة تفتح لكن الأدوات ما تشتغل (دمج/تقسيم...):** تأكد إن `/pdf.worker.min.mjs`
  يرجع 200 (`curl -I http://السيرفر:3000/pdf.worker.min.mjs`) — لازم يكون موجود ضمن
  `public/` في الريبو ويُخدَّم تلقائيًا من Next.js.
