const dotenv = require("dotenv");
dotenv.config();

const fastify = require("fastify")({ logger: true });
const { MongoClient } = require("mongodb");

// MongoDB Configuration
const uri = process.env.MONGODB_URI;
const dbName = "neo4J";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// SQL-like Query Structure Adapted for MongoDB
const exportDocumentQuery = {
  $match: { id: "01FCBACZIFWRL22JSIMJAYZJ5UAYIDY36K" },
};
const lookupStages = [
  {
    $lookup: {
      from: "users",
      localField: "created_by",
      foreignField: "id",
      as: "createdBy",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "last_modified_by",
      foreignField: "id",
      as: "lastModifiedBy",
    },
  },
  {
    $lookup: {
      from: "folders",
      localField: "parent_folder_id",
      foreignField: "id",
      as: "parentReference",
    },
  },
  {
    $lookup: {
      from: "fileMetadata",
      localField: "id",
      foreignField: "document_id",
      as: "fileMetadata",
    },
  },
  {
    $lookup: {
      from: "versions",
      localField: "id",
      foreignField: "document_id",
      as: "versions",
    },
  },
  {
    $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true },
  },
  {
    $unwind: { path: "$lastModifiedBy", preserveNullAndEmptyArrays: true },
  },
  {
    $unwind: { path: "$parentReference", preserveNullAndEmptyArrays: true },
  },
  {
    $unwind: { path: "$fileMetadata", preserveNullAndEmptyArrays: true },
  },
  {
    $unwind: { path: "$versions", preserveNullAndEmptyArrays: true },
  },
];

// Fastify Route for Export Document
fastify.get("/export/document/:documentId", async (request, reply) => {
  const { documentId } = request.params;
  let connection;
  try {
    connection = await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("documents");
    console.time(`MongoDB Query - ${documentId}`);
    const result = await collection
      .aggregate([{ $match: { id: documentId } }, ...lookupStages])
      .toArray();
    console.timeEnd(`MongoDB Query - ${documentId}`);

    fastify.log.debug(
      `Raw query result for ${documentId}: ${JSON.stringify(result)}`
    );

    if (!result || result.length === 0) {
      fastify.log.warn(`Document not found: ${documentId}`);
      return reply
        .status(404)
        .send({ error: `Document not found: ${documentId}` });
    }

    const document = result[0];
    const response = {
      name: document.name,
      source: document.source,
      file_name: document.file_name,
      lastModifiedDate: document.lastModifiedDate,
      size: document.size,
      id: document.id,
      site_id: document.site_id,
      drive_id: document.drive_id,
      label: document.label,
      type: document.type,
      "@microsoft.graph.downloadUrl": document["@microsoft.graph.downloadUrl"],
      createdBy: document.createdBy
        ? {
            id: document.createdBy.id,
            email: document.createdBy.email,
            displayName: document.createdBy.display_name,
          }
        : null,
      createdDateTime: document.created_date_time,
      lastModifiedBy: document.lastModifiedBy
        ? {
            id: document.lastModifiedBy.id,
            email: document.lastModifiedBy.email,
            displayName: document.lastModifiedBy.display_name,
          }
        : null,
      lastModifiedDateTime: document.last_modified_date_time,
      parentReference: document.parentReference
        ? {
            id: document.parentReference.id,
            name: document.parentReference.name,
            path: document.parentReference.path,
            driveType: document.parentReference.drive_type,
            driveId: document.parentReference.drive_id,
            siteId: document.parentReference.site_id,
          }
        : null,
      webUrl: document.web_url,
      cTag: document.versions?.c_tag,
      eTag: document.versions?.e_tag,
      file: document.fileMetadata
        ? {
            hashes: { quickXorHash: document.fileMetadata.quick_xor_hash },
            mimeType: document.fileMetadata.mime_type,
          }
        : null,
      fileSystemInfo: document.fileMetadata
        ? {
            createdDateTime: document.fileMetadata.created_date_time,
            lastModifiedDateTime: document.fileMetadata.last_modified_date_time,
          }
        : null,
      shared: document.fileMetadata
        ? { scope: document.fileMetadata.shared_scope }
        : null,
      status: document.status,
    };

    fastify.log.info(`Exported document: ${documentId}`);
    return response;
  } catch (error) {
    fastify.log.error(`Error exporting document: ${error.message}`);
    return reply
      .status(400)
      .send({ error: `Error exporting document: ${error.message}` });
  } finally {
    if (connection) await connection.close();
  }
});

// Start Server
const start = async () => {
  try {
    await client.connect();
    fastify.log.info("MongoDB connection established");
    await fastify.listen({ port: 6969 });
    fastify.log.info("Server running on http://localhost:6969");
  } catch (error) {
    fastify.log.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

// Cleanup on Shutdown
process.on("SIGINT", async () => {
  fastify.log.info("Shutting down server");
  await client.close();
  await fastify.close();
  process.exit(0);
});

start();
