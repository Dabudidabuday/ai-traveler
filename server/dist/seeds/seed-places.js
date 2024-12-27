"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("@langchain/openai");
const output_parsers_1 = require("@langchain/core/output_parsers");
const mongodb_1 = require("mongodb");
const mongodb_2 = require("@langchain/mongodb");
const zod_1 = require("zod");
require("dotenv/config");
const client = new mongodb_1.MongoClient(process.env.MONGODB_ATLAS_URI);
const llm = new openai_1.ChatOpenAI({
    modelName: "gpt-4-turbo-preview",
    temperature: 0.7,
});
const PlaceSchema = zod_1.z.object({
    place_id: zod_1.z.string(),
    name: zod_1.z.string(),
    type: zod_1.z.enum(['attraction', 'restaurant', 'museum', 'park', 'historical_site', 'entertainment']),
    location: zod_1.z.object({
        address: zod_1.z.string(),
        city: zod_1.z.string(),
        country: zod_1.z.string(),
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }),
    details: zod_1.z.object({
        description: zod_1.z.string(),
        atmosphere: zod_1.z.string(),
        workingHours: zod_1.z.string(),
        priceRange: zod_1.z.string(),
        bestTimeToVisit: zod_1.z.string(),
    }),
    accessibility: zod_1.z.object({
        publicTransport: zod_1.z.boolean(),
        wheelchair: zod_1.z.boolean(),
        parking: zod_1.z.boolean(),
    }),
    ratings: zod_1.z.object({
        average: zod_1.z.number(),
        numberOfReviews: zod_1.z.number(),
    }),
    features: zod_1.z.array(zod_1.z.string()),
    tags: zod_1.z.array(zod_1.z.string()),
    recommendations: zod_1.z.array(zod_1.z.object({
        tip: zod_1.z.string(),
        category: zod_1.z.string(),
        relevance: zod_1.z.number(),
    })),
    nearbyPlaces: zod_1.z.array(zod_1.z.string()),
    images: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string(),
        caption: zod_1.z.string(),
    })),
    seasonality: zod_1.z.object({
        highSeason: zod_1.z.array(zod_1.z.string()),
        lowSeason: zod_1.z.array(zod_1.z.string()),
        weatherConsiderations: zod_1.z.string(),
    }),
});
const parser = output_parsers_1.StructuredOutputParser.fromZodSchema(zod_1.z.array(PlaceSchema));
async function generateSyntheticData() {
    const prompt = `You are a travel expert that generates detailed place data for an AI travel recommendation system. Generate 10 interesting places in various cities. Each record should include comprehensive details about the location, features, and travel recommendations. Make sure to include a mix of different types of places (attractions, restaurants, museums, etc.) with realistic values for all fields.

  ${parser.getFormatInstructions()}`;
    console.log("Generating synthetic travel data...");
    const response = await llm.invoke(prompt);
    return parser.parse(response.content);
}
async function createPlaceSummary(place) {
    const basicInfo = `${place.name} is a ${place.type} located in ${place.location.city}, ${place.location.country}`;
    const details = `${place.details.description}. Atmosphere: ${place.details.atmosphere}`;
    const features = `Features: ${place.features.join(", ")}`;
    const recommendations = place.recommendations
        .map((rec) => `${rec.tip} (${rec.category})`)
        .join(" ");
    const accessibility = `Accessibility: Public Transport: ${place.accessibility.publicTransport}, Wheelchair: ${place.accessibility.wheelchair}`;
    return `${basicInfo}. ${details}. ${features}. Tips: ${recommendations}. ${accessibility}`;
}
async function seedDatabase() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Connected to MongoDB successfully!");
        const db = client.db("travel_database");
        const collection = db.collection("places");
        await collection.deleteMany({});
        const syntheticData = await generateSyntheticData();
        const placesWithSummaries = await Promise.all(syntheticData.map(async (record) => ({
            pageContent: await createPlaceSummary(record),
            metadata: { ...record },
        })));
        for (const place of placesWithSummaries) {
            await mongodb_2.MongoDBAtlasVectorSearch.fromDocuments([place], new openai_1.OpenAIEmbeddings(), {
                collection,
                indexName: "places_vector_index",
                textKey: "embedding_text",
                embeddingKey: "embedding",
            });
            console.log("Successfully processed & saved place:", place.metadata.place_id);
        }
        console.log("Travel database seeding completed");
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
    finally {
        await client.close();
    }
}
seedDatabase().catch(console.error);
