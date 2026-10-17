HOTEL LOCAL ORDER SYSTEM — हिंदी में सेटअप
=============================================

यह शुरुआती चलने योग्य लोकल वेब ऐप है। इसमें 60 टेबल, Captain Order, Menu Management, Orders, भुगतान स्थिति, किचन स्लिप और ग्राहक बिल के print layouts हैं।

ज़रूरी सीमा:
- यह ZIP अपने-आप इंस्टॉल होने वाला EXE/APK नहीं है।
- ऑर्डर और मेन्यू कंप्यूटर के data.json में सेव होते हैं।
- प्रिंट बटन ब्राउज़र का Print dialog खोलते हैं। वहाँ किचन या बिल वाला सही प्रिंटर चुनें। अभी silent auto-print / अलग प्रिंटर पर स्वतः routing शामिल नहीं है।
- पासवर्ड एक साझा staff password है; multi-user roles, HTTPS, hardened sessions और production security review अभी नहीं है।
- यह लोकल LAN ऐप है। इसे सीधे Netlify पर upload करने से backend नहीं चलेगा।
- ऑनलाइन hosting करने पर printer तक पहुँचने के लिए अलग सुरक्षित local print agent/bridge चाहिए।

Windows 10 पर:
1. Node.js 20+ LTS इंस्टॉल करें: https://nodejs.org/
2. ZIP को Extract All करें।
3. निकले फ़ोल्डर में `.env.example` की copy बनाकर नाम `.env` रखें।
4. `.env` को Notepad में खोलें:
   HOTEL_NAME=अपने होटल का नाम
   APP_PASSWORD=अपना मजबूत पासवर्ड
   SESSION_SECRET=लंबा अनोखा random secret
   PORT=3000
5. फ़ोल्डर के खाली हिस्से में Shift + right click करके “Open PowerShell window here” या address bar में cmd लिखें।
6. चलाएँ:
   npm install
   npm start
7. कंप्यूटर पर खोलें: http://localhost:3000
8. उसी Wi-Fi पर फोन से खोलें: http://कंप्यूटर-का-IPv4:3000
   उदाहरण: http://192.168.1.31:3000
9. Windows Firewall पूछे तो केवल Private network पर अनुमति दें। अगर फोन नहीं खुलता, Windows Firewall में Node.js/port 3000 को Private network के लिए अनुमति दें। होटल के Wi-Fi router में client isolation चालू हो तो फोन कंप्यूटर तक नहीं पहुँचेगा।

पहली लॉगिन:
`.env` में APP_PASSWORD का जो पासवर्ड रखा है, वही डालें। अगर `.env` नहीं बनाया, तो default पासवर्ड इस्तेमाल न करें; पहले `.env` बनाना अनिवार्य समझें।

मेन्यू:
Menu tab में नए आइटम/कीमतें जोड़ें। उदाहरण वाले आइटम बदलें। मौजूदा आइटम disable किए जा सकते हैं।

प्रिंट:
ऑर्डर भेजने पर किचन स्लिप का print dialog खुलता है। Orders & Billing टैब से Kitchen Slip या Customer Bill अलग-अलग प्रिंट करें। हर print dialog में संबंधित printer चुनें। Browser silent printing के लिए अलग configuration/agent चाहिए।

सुरक्षा:
इस ऐप को सीधे public internet पर expose न करें। इसमें HTTPS, brute-force rate limiting, admin/captain अलग roles, secure cookie settings और production deployment hardening अभी नहीं है। होटल के अंदर भरोसेमंद Private Wi-Fi पर test करें और data.json का backup रखें.
