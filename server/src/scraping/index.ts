const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');
const proxyChain = require('proxy-chain');
const { zodResponseFormat } = require('openai/helpers/zod');
const { z } =  require('zod');
const puppeteer = require('puppeteer');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SiteLinks = z.array(z.string());

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});

export const scrapeEvents = async ({ message, tripTheme, country, city }: { message: string, tripTheme: string, country: string, city: string }) => {
  let events: Event[] = [];

  try {

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        `--proxy-server=httpsr=brd.superproxy.io:33335`,
      ],
    });

    const page = await browser.newPage();

    await page.authenticate({
      username: process.env.BRIGHT_DATA_USERNAME,
      password: process.env.BRIGHT_DATA_PASSWORD
    });

    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    setTimeout(() => null, 1000)

    await page.setViewport({ width: 1920, height: 1080 });

    const monthAndYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const searchQuery = `musical concerts and events in ${monthAndYear} in ${city}, ${country}`;
    await page.goto('https://www.google.com/search?q=' + searchQuery);

    await page.waitForSelector('body');
    const hrefs = await page.evaluate(() => {
      return [...new Set(Array.from(
        document.querySelectorAll('div#search a'))
          .map(a => (a as HTMLAnchorElement).href)
          .filter(href => !href.includes('google')
      ))];
    });

    for(let i = 0; i < 4; i++) {
      try {

        console.log('hrefs[i]', hrefs[i]);
        await page.goto(hrefs[i], {
          waitUntil: ['load', 'domcontentloaded'],
        });

        await page.waitForSelector('body');
        const body = await page.evaluate(() => document.body.innerText);

        const today = new Date().toISOString().split('T')[0];
      
        const completion = await openai.chat.completions.create({
          model: "grok-2-1212",
          messages: [
            { role: "user", content: `
              Give me the detailed information about upcoming concerts/events in ${city}, ${country}.
              The event must be upcomping, it means date must be not earlier than ${today} and not later than 2 weeks from ${today}.
              Grab src image related to event and put it in eventImageSrc field.
              If there is no image, put empty string in eventImageSrc field.

              ${tripTheme ? `Each event has to be related to ${tripTheme} theme.` : ''}
              ${message ? `Consider this wishes ${message} theme.` : ''}
              
              Return only events, concerts, festivals, shows, parties.
              Do not return any other kind of data.
              Do not return event if not enough specific information about it, just skip it.
              If you are not sure in the event data, skip it.
              Here is the scraped page: ${body}. Return in valid JSON format.` },
          ],
          response_format: zodResponseFormat(
            z.array(
              z.object({
                name: z.string(),
                shortDescription: z.string(),
                date: z.string(),
                time: z.string(),
                locationName: z.string(),
                eventImageSrc: z.string(),
                sourceLink: z.string(),
                googleMapsLocation: z.string(),
                location: z.object({
                  latitude: z.number(),
                  longitude: z.number()
                }),
              })
            )
          , 'event'), 
          temperature: 0
        });

        const eventDetails = completion.choices[0].message.content;

        const parsedEvents = JSON.parse(eventDetails);
        console.log('eventDetails', parsedEvents);
        events.push(...parsedEvents);
        
      } catch(error) {
        console.error('Error scraping events from parsed links:', error);
      }
    }
    await browser.close();

  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }

  console.log('events', events);

  return events;
}

 // scrapePlaces()
//   .catch(error => {
//     console.error('Failed to scrape places:', error);
//     process.exit(1);
//   });
