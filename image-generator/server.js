const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

console.log('--- SERVER STARTING UP ---');
console.log('Time:', new Date().toISOString());

/**
 * Health check / Wake up endpoint
 */
app.get('/', (req, res) => {
    res.send('Image Generator is Awake and Ready!');
});

/**
 * Generate image from template
 * POST /generate
 * Body: { title, content, category, imageUrl, logoUrl }
 */
app.post('/generate', async (req, res) => {
    const { title, content, category, imageUrl, logoUrl } = req.body;

    if (!title) {
        return res.status(400).send({ error: 'Title is required' });
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: "new"
        });
        const page = await browser.newPage();

        // Load the HTML template and CSS
        let html = fs.readFileSync(path.join(__dirname, 'templates', 'post-template.html'), 'utf8');
        let css = fs.readFileSync(path.join(__dirname, 'templates', 'style.css'), 'utf8');

        // Inject CSS directly into the HTML
        html = html.replace('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`);

        // Simple string replacement for dynamic content
        html = html
            .replace('{{TITLE}}', title)
            .replace('{{CONTENT}}', content || '')
            .replace('{{CATEGORY}}', category || 'أخبار الملكي ⚪️')
            .replace('{{IMAGE_URL}}', imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1000')
            .replace('{{LOGO_URL}}', logoUrl || '');

        await page.setViewport({ width: 1080, height: 1080 }); 
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const screenshot = await page.screenshot({ type: 'png' });

        res.set('Content-Type', 'image/png');
        res.send(screenshot);
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send({ error: 'Failed to generate image' });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`Image Generator running on port ${PORT}`);
});
