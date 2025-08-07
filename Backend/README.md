# StyleMart Backend

यह StyleMart ई-कॉमर्स वेबसाइट का बैकएंड सेक्शन है।

## सेटअप निर्देश

1. निम्न कमांड चलाकर आवश्यक पैकेज इंस्टॉल करें:
   ```
   npm install
   ```

2. `.env` फ़ाइल बनाएं और निम्न वेरिएबल्स सेट करें:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. सर्वर शुरू करने के लिए:
   ```
   npm start
   ```

## एडमिन यूजर बनाना

### डिफॉल्ट एडमिन बनाना

StyleMart में एक डिफॉल्ट एडमिन यूजर बनाने के लिए, निम्न कमांड चलाएं:

```
npm run create-admin
```

यह कमांड निम्न डिफॉल्ट क्रेडेंशियल्स के साथ एक एडमिन यूजर बनाएगा:

- **यूजरनेम**: admin
- **ईमेल**: admin@stylemart.com
- **पासवर्ड**: admin123

### कस्टम क्रेडेंशियल्स के साथ एडमिन बनाना

आप अपने पसंद के क्रेडेंशियल्स के साथ एडमिन यूजर बना सकते हैं:

```
node scripts/createAdmin.js [username] [email] [password]
```

उदाहरण:

```
node scripts/createAdmin.js superadmin admin@example.com securepassword123
```

**महत्वपूर्ण**: सुरक्षा कारणों से, पहले लॉगिन के बाद डिफॉल्ट पासवर्ड को बदलना सुनिश्चित करें।

## उपलब्ध API एंडपॉइंट्स

- **यूजर्स**: `/api/users`
- **प्रोडक्ट्स**: `/api/products`
- **ऑर्डर्स**: `/api/orders`
- **ऑथेंटिकेशन**: `/api/auth`