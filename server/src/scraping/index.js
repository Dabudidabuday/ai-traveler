const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');
const { zodResponseFormat } = require('openai/helpers/zod');
const { z } =  require('zod');
const puppeteer = require('puppeteer');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});

async function scrapePlaces() {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    
      // headless: false,
      // args: ['--proxy-server=brd.superproxy.io:33335'],

      // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      // browserWSEndpoint: `wss://${process.env.BRIGHT_DATA_USERNAME}:${process.env.BRIGHT_DATA_PASSWORD}@brd.superproxy.io:33335`,
    });

    const page = await browser.newPage();

    await page.authenticate({
      username: process.env.BRIGHT_DATA_USERNAME,
      password: process.env.BRIGHT_DATA_PASSWORD
    });

    setTimeout(() => null, 1000)

    await page.setViewport({ width: 1920, height: 1080 });

    const searchQuery = `musical concerts and events 24.12.2024 in Bangkok, Thailand`;
    await page.goto('https://www.google.com/search?q=' + searchQuery);

    await page.waitForSelector('body');

    const body = await page.evaluate(() => document.body.innerText);

    const completion = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content:
            "You need to analyze scraped page to get concerts/tickets/events site links with most potential to get detailed information about upcoming concerts in Specific city. Return only 5 links.",
        },
        {
          role: "user",
          content: `Give me the list of urls about musical concerts in Bangkok, Thailand at 24.12.2024. Here is the scraped page: ${body}`,
        },
      ],
      response_format: zodResponseFormat(z.array(z.string()), 'event'), 
      temperature: 0
    });
  
    const eventSitesLinks = completion.choices[0].message.content;

    const events = [];

    for(const link of eventSitesLinks) {
      const url = new URL(link);

      await page.goto(url.toString());
      await page.waitForSelector('body');
      const body = await page.evaluate(() => document.body.innerText);

      const completion = await openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          { role: "user", content: `Give me the detailed information about upcoming concerts in Bangkok, Thailand at 24.12.2024. Here is the scraped page: ${body}` },
        ],
        response_format: zodResponseFormat(z.object({
          name: z.string(),
          description: z.string(),
          date: z.string(),
          time: z.string(),
          location: z.string(),
        }), 'event'), 
        temperature: 0
      });

      const eventDetails = completion.choices[0].message.content;
      events.push(eventDetails);
    }

    console.log('events', events);
    await browser.close();
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}

scrapePlaces()
  .catch(error => {
    console.error('Failed to scrape places:', error);
    process.exit(1);
  });
