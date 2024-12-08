const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
    // Tarayıcıyı başlat
    const browser = await puppeteer.launch({
        headless: true, // Tarayıcıyı arka planda çalıştır
        defaultViewport: { width: 1920, height: 1080 }
    });

    // Yeni bir sayfa oluştur
    const page = await browser.newPage();

    // Instagram sayfasına git
    await page.goto('https://instagram.com/emineey41', {
        waitUntil: 'networkidle2', // Sayfa tamamen yüklendiğinde devam et
    });

    // Ekran görüntüsünü al
    const screenshotPath = 'instagram_screenshot.png';
    await page.screenshot({ path: screenshotPath });

    console.log('Ekran görüntüsü alındı: instagram_screenshot.png');

    // Tarayıcıyı kapat
    await browser.close();

    // Telegram API'ye gönderim
    const chatId = '2090459804'; // Telegram chat ID'nizi buraya girin
    const botToken = '6435977146:AAExFsusLAtoivKFKW01Ca1hCsQOVIf2H7I'; // Bot tokeninizi buraya girin

    // FormData nesnesini oluştur
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', fs.createReadStream(screenshotPath));

    try {
        // Telegram'a gönderim yap
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendDocument`, formData, {
            headers: formData.getHeaders(),
        });

        // Başarılı yanıt
        res.send(`
            <html>
                <body>
                    <h1>Başarı</h1>
                    <p>Ekran görüntüsü başarıyla gönderildi!</p>
                    <p>Telegram yanıtı: ${JSON.stringify(response.data)}</p>
                </body>
            </html>
        `);
    } catch (error) {
        // Hata durumunda
        console.error('Telegram mesajı gönderilemedi:', error);
        res.status(500).send(`
            <html>
                <body>
                    <h1>Hata</h1>
                    <p>Telegram mesajı gönderilemedi!</p>
                    <p>Hata mesajı: ${error.message}</p>
                </body>
            </html>
        `);
    }
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
