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

    const searchQuery = `event+calendar+for+${monthAndYear}+in+${city},+${country}`;
    await page.goto('https://www.google.com/search?q=' + searchQuery);

    await page.waitForSelector('body');
    const hrefs = await page.evaluate(() => {
      return [...new Set(Array.from(
        document.querySelectorAll('div#search a'))
          .map(a => (a as HTMLAnchorElement).href)
          .filter(href => !href.includes('google')
      ))];
    });

    for(let i = 0; i < 5; i++) {
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
            {
              role: "system",
              content: `
                You are an expert in events and parties.
                You are given a page with events and different parties.
                Your goal is to get the most information about events and parties in ${city}, ${country}.
                You are asked to provide detailed information about each event.

                You have to provide the location full address of each event and source link to this event.
                Example of full location address: 
                <example-model>
                 { fullAddress: "123 Main St, New York, NY 10001" }
                 { fullAddress: "Soi Sukhumvit 26, Khlong Tan, Khlong Toei, Bangkok 10110" }
                </example-model>

                You asked to provide source link from where you get this specific event.
                Example of source link:
                <example-model>
                 { sourceLink: "https://visit.bangkok.go.th/festival-calendar" }
                 { sourceLink: "https://www.businesseventsthailand.com/en/event-calendar" }
                </example-model>
                Do not change the source link, just return it in valid format.
                Do not generate source link by yourself, just return it as it is in valid format.

                You need to provide location name of each event.
                Example of location name:
                <example-model>
                 { locationName: "Bar 'The Gypsy', Bangkok" }
                 { locationName: "Restaurant 'The Citrom', Da Nang" }
                 { locationName: "Club 'The Moon', Phuket" }
                </example-model>

                You need to provide event name.
                Example of event name:
                <example-model>
                 { eventName: "Thai New Year Party" }
                 { eventName: "Latina evening at 'The Gypsy'" }
                 { eventName: "Festival of Lights" }
                </example-model>

                You need to provide event date.
                Example of event date:
                <example-model>
                 { date: "31-12-2024" }
                 { date: "02-01-2025" }
                 { date: "15-10-2025" }
                 </example-model>
                
                Return only events, concerts, festivals, shows, parties.
                Do not return any other kind of data.
                Do not return event if not enough specific information about it, just skip it.
                Do not hallucinate, just return what you see in the page.

                if you are not sure about the information, do not return value in the field.

                Just return empty string instead of "unknown" or "unavailable".
                <example-model>
                 { date: "" }
                 { locationName: "" }
                 { eventName: "" }
                </example-model>
              `
            },
            { role: "user", content: `
              ${tripTheme ? `Each event has to be related to ${tripTheme} theme.` : ''}
              ${message ? `Consider this wishes ${message} theme.` : ''}

              The event must be upcomping, it means date must be not earlier than ${today} and not later than 2 weeks from ${today}.
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
                fullAddress: z.string(),
                sourceLink: z.string(),
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

  return events;
}
