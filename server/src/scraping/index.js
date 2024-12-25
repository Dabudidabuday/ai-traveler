const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');
const { zodResponseFormat } = require('openai/helpers/zod');
const { z } =  require('zod');
const puppeteer = require('puppeteer');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SiteLinks = z.array(z.string());

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});

const scrapePlaces = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--proxy-server=brd.superproxy.io:33335'],

      // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      // browserWSEndpoint: `wss://${process.env.BRIGHT_DATA_USERNAME}:${process.env.BRIGHT_DATA_PASSWORD}@brd.superproxy.io:33335`,
    });

    const page = await browser.newPage();

    await page.authenticate({
      username: process.env.BRIGHT_DATA_USERNAME,
      password: process.env.BRIGHT_DATA_PASSWORD
    });

    setTimeout(() => null, 1000)

    console.log('page', page);
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
            `You need to analyze scraped page to get concerts/tickets/events site links with most potential to get detailed information about upcoming concerts in Specific city.
            Find direct URLs for events and concerts. 
            Return only valid, direct URLs, one per line, starting with https://.
            Do not include any additional text, template literals, or formatting.
            Example format:
            https://example1.com/events
            https://example2.com/concerts
            Return 7 links in JSON format in Array object.`,
        },
        {
          role: "user",
          content: `
            Give me the list of urls about musical concerts in Bangkok, Thailand at 24.12.2024.
            
            Here is the scraped page: ${body}`,
        },
      ],
      response_format: zodResponseFormat(SiteLinks, 'eventSitesLinks'), 
      temperature: 0.3
    });
  
    const eventSitesLinks = await completion.choices[0].message.content;
    console.log('eventSitesLinks', eventSitesLinks);
    const events = [];
    
    const formattedEventSitesLinks = eventSitesLinks.split('\n')
      .map(line => line.trim().replace(/[",]/g, ''))
      .filter(line => line && line.startsWith('https://'))

    for(let i = 0; i < formattedEventSitesLinks.length; i++) {
      console.log('formattedEventSitesLinks[i]', formattedEventSitesLinks[i]);
      await page.goto(formattedEventSitesLinks[i], {
        waitUntil: ['load', 'domcontentloaded'],
      });

      await page.waitForSelector('body');
      const body = await page.evaluate(() => document.body.innerText);

      console.log('body', body);

      // const completion = await openai.chat.completions.create({
      //   model: "grok-2-1212",
      //   messages: [
      //     { role: "user", content: `Give me the detailed information about upcoming concerts/events in Bangkok, Thailand at 24.12.2024. Here is the scraped page: ${body}` },
      //   ],
      //   response_format: zodResponseFormat(z.array(
      //     z.object({
      //       name: z.string(),
      //       atmosphere: z.string(),
      //       workingHours: z.string(),
      //       googleMapAddress: z.string(),
      //       advice: z.string(),
      //       location: z.object({
      //         latitude: z.number(),
      //         longitude: z.number()
      //       }),
      //       placeType: z.string()
      //     })
      //   ), 'event'), 
      //   temperature: 0
      // });

      // const eventDetails = completion.choices[0].message.content;
      // events.push(eventDetails);
    }

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
