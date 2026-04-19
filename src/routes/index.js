const express = require('express');
const router = express.Router();

// Hub page - Lab selection
router.get('/', (req, res) => {
  const labs = [
    {
      number: '01',
      title: 'API Tester',
      description: 'ทดสอบ HTTP Methods ผ่าน Developer Portal',
      topic: 'Web Essentials',
      topicColor: 'blue',
      path: '/lab01'
    },
    {
      number: '02',
      title: 'ระบบสมาชิก',
      description: 'เข้าสู่ระบบและจัดการโปรไฟล์สมาชิก',
      topic: 'Web Essentials',
      topicColor: 'blue',
      path: '/lab02'
    },
    {
      number: '03',
      title: 'Employee DB Explorer',
      description: 'สำรวจฐานข้อมูลพนักงาน (Internal)',
      topic: 'SQL Injection',
      topicColor: 'purple',
      path: '/lab03'
    },
    {
      number: '04',
      title: 'Seller Portal',
      description: 'เข้าสู่ระบบสำหรับผู้ขาย',
      topic: 'SQL Injection',
      topicColor: 'purple',
      path: '/lab04'
    },
    {
      number: '05',
      title: 'Staff Directory',
      description: 'ค้นหาข้อมูลพนักงานในองค์กร',
      topic: 'SQL Injection',
      topicColor: 'purple',
      path: '/lab05'
    },
    {
      number: '06',
      title: 'หมวดหมู่สินค้า',
      description: 'เรียกดูสินค้าตามหมวดหมู่',
      topic: 'SQL Injection',
      topicColor: 'purple',
      path: '/lab06?id=1'
    },
    {
      number: '07',
      title: 'ค้นหาสินค้า',
      description: 'ค้นหาสินค้าที่คุณต้องการ',
      topic: 'XSS',
      topicColor: 'red',
      path: '/lab07'
    },
    {
      number: '08',
      title: 'ค้นหาสมาชิก',
      description: 'ค้นหาและดูโปรไฟล์สมาชิก',
      topic: 'XSS',
      topicColor: 'red',
      path: '/lab08'
    },
    {
      number: '09',
      title: 'รีวิวสินค้า',
      description: 'อ่านและเขียนรีวิวสินค้า',
      topic: 'XSS',
      topicColor: 'red',
      path: '/lab09'
    },
    {
      number: '10',
      title: 'Flash Sale',
      description: 'สินค้าลดราคาพิเศษ (Burp Intercept)',
      topic: 'Burp Suite',
      topicColor: 'orange',
      path: '/lab10'
    },
    {
      number: '11',
      title: 'Internal API',
      description: 'เข้าถึง API ลับ (Burp Repeater)',
      topic: 'Burp Suite',
      topicColor: 'orange',
      path: '/lab11'
    },
    {
      number: '12',
      title: 'Gift Card',
      description: 'แลก Gift Card (Burp Intruder)',
      topic: 'Burp Suite',
      topicColor: 'orange',
      path: '/lab12'
    }
  ];

  res.render('hub', { title: 'หน้าแรก', labs });
});

module.exports = router;
