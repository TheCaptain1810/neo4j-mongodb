const dotenv = require("dotenv");
dotenv.config();

// Connect to MongoDB and insert sample data (run this separately or in a script)
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function setupMongoDB() {
  try {
    await client.connect();
    const db = client.db("neo4J");
    await db.collection("users").insertOne({
      id: "354a020c-cf84-4e30-afd3-07ba0b07c4fc",
      email: "tom@hoppa.ai",
      display_name: "Tom Goldsmith",
    });
    await db.collection("folders").insertOne({
      id: "01FCBACZKAABKJMBSJT5CJHMDH26OD3W33",
      name: "Borehole Records - Petersfield",
      path: "/drives/b!CPeuVHbWjUyD_9doA6Td6m8HS9IQoW9DtDb__nkwj-M92i-qf_-pRKp11I7IA7Pu/root:/Main/Sample Documents/Borehole Records - Petersfield",
      drive_type: "documentLibrary",
      drive_id:
        "b!CPeuVHbWjUyD_9doA6Td6m8HS9IQoW9DtDb__nkwj-M92i-qf_-pRKp11I7IA7Pu",
      site_id: "54aef708-d676-4c8d-83ff-d76803a4ddea",
    });
    await db.collection("documents").insertOne({
      id: "01FCBACZIFWRL22JSIMJAYZJ5UAYIDY36K",
      name: "BGS borehole 426100 (SU72SW51).pdf",
      label: "BGS borehole 426100 (SU72SW51).pdf",
      size: 3040,
      source: "sharepoint",
      type: "application/pdf",
      created_date_time: new Date("2024-12-17T10:31:25Z"),
      last_modified_date_time: new Date("2024-12-17T10:31:25Z"),
      web_url: "https://hoppatechnologies.sharepoint.com/...",
      download_url: "https://hoppatechnologies.sharepoint.com/...",
      drive_id:
        "b!CPeuVHbWjUyD_9doA6Td6m8HS9IQoW9DtDb__nkwj-M92i-qf_-pRKp11I7IA7Pu",
      site_id: "54aef708-d676-4c8d-83ff-d76803a4ddea",
      status: "N/A",
      created_by: "354a020c-cf84-4e30-afd3-07ba0b07c4fc",
      last_modified_by: "354a020c-cf84-4e30-afd3-07ba0b07c4fc",
      parent_folder_id: "01FCBACZKAABKJMBSJT5CJHMDH26OD3W33",
    });
    await db.collection("fileMetadata").insertOne({
      id: "550e8400-e29b-41d4-a716-446655440000",
      document_id: "01FCBACZIFWRL22JSIMJAYZJ5UAYIDY36K",
      mime_type: "application/pdf",
      quick_xor_hash: "yXrJBwDlOIJTPw9eEQO6o2UT8NE=",
      shared_scope: "users",
      created_date_time: new Date("2024-12-17T10:31:25Z"),
      last_modified_date_time: new Date("2024-12-17T10:31:25Z"),
    });
    await db.collection("versions").insertOne({
      id: "550e8400-e29b-41d4-a716-446655440001",
      document_id: "01FCBACZIFWRL22JSIMJAYZJ5UAYIDY36K",
      e_tag: "{AD57B405-4826-4162-8CA7-B406103C6FCA},1",
      c_tag: "c:{AD57B405-4826-4162-8CA7-B406103C6FCA},1",
      timestamp: new Date("2024-12-17T10:31:25Z"),
      version_number: 1,
    });
    console.log("Sample data inserted");
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

setupMongoDB();
