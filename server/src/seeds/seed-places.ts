import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { z } from "zod";
import "dotenv/config";

const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string);

const llm = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.7,
});

const PlaceSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  type: z.enum(['attraction', 'restaurant', 'museum', 'park', 'historical_site', 'entertainment']),
  location: z.object({
    address: z.string(),
    city: z.string(),
    country: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  details: z.object({
    description: z.string(),
    atmosphere: z.string(),
    workingHours: z.string(),
    priceRange: z.string(),
    bestTimeToVisit: z.string(),
  }),
  accessibility: z.object({
    publicTransport: z.boolean(),
    wheelchair: z.boolean(),
    parking: z.boolean(),
  }),
  ratings: z.object({
    average: z.number(),
    numberOfReviews: z.number(),
  }),
  features: z.array(z.string()),
  tags: z.array(z.string()),
  recommendations: z.array(
    z.object({
      tip: z.string(),
      category: z.string(),
      relevance: z.number(),
    })
  ),
  nearbyPlaces: z.array(z.string()),
  images: z.array(
    z.object({
      url: z.string(),
      caption: z.string(),
    })
  ),
  seasonality: z.object({
    highSeason: z.array(z.string()),
    lowSeason: z.array(z.string()),
    weatherConsiderations: z.string(),
  }),
});

type Place = z.infer<typeof PlaceSchema>;

const parser = StructuredOutputParser.fromZodSchema(z.array(PlaceSchema));

async function generateSyntheticData(): Promise<Place[]> {
  const prompt = `You are a travel expert that generates detailed place data for an AI travel recommendation system. Generate 10 interesting places in various cities. Each record should include comprehensive details about the location, features, and travel recommendations. Make sure to include a mix of different types of places (attractions, restaurants, museums, etc.) with realistic values for all fields.

  ${parser.getFormatInstructions()}`;

  console.log("Generating synthetic travel data...");

  const response = await llm.invoke(prompt);
  return parser.parse(response.content as string);
}

async function createPlaceSummary(place: Place): Promise<string> {
  const basicInfo = `${place.name} is a ${place.type} located in ${place.location.city}, ${place.location.country}`;
  const details = `${place.details.description}. Atmosphere: ${place.details.atmosphere}`;
  const features = `Features: ${place.features.join(", ")}`;
  const recommendations = place.recommendations
    .map((rec) => `${rec.tip} (${rec.category})`)
    .join(" ");
  const accessibility = `Accessibility: Public Transport: ${place.accessibility.publicTransport}, Wheelchair: ${place.accessibility.wheelchair}`;
  
  return `${basicInfo}. ${details}. ${features}. Tips: ${recommendations}. ${accessibility}`;
}

async function seedDatabase(): Promise<void> {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB successfully!");

    const db = client.db("travel_database");
    const collection = db.collection("places");

    await collection.deleteMany({});
    
    const syntheticData = await generateSyntheticData();

    const placesWithSummaries = await Promise.all(
      syntheticData.map(async (record) => ({
        pageContent: await createPlaceSummary(record),
        metadata: {...record},
      }))
    );
    
    for (const place of placesWithSummaries) {
      await MongoDBAtlasVectorSearch.fromDocuments(
        [place],
        new OpenAIEmbeddings(),
        {
          collection,
          indexName: "places_vector_index",
          textKey: "embedding_text",
          embeddingKey: "embedding",
        }
      );

      console.log("Successfully processed & saved place:", place.metadata.place_id);
    }

    console.log("Travel database seeding completed");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error); 
