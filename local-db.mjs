import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

(async () => {
    try {
        // Ensure the local database directory exists
        const dbPath = path.resolve(process.cwd(), '.local-db');
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath);
            console.log(`Created new local db directory at ${dbPath}`);
        }

        console.log('⏳ Starting Local MongoDB from memory server...');
        const mongod = await MongoMemoryServer.create({
            instance: {
                dbPath, // Persist data to the project folder
                storageEngine: 'wiredTiger',
                port: 27017, // Standard mongo port
            }
        });

        const uri = mongod.getUri();
        console.log(`\n✅ Local MongoDB successfully started!`);
        console.log(`🔗 URI: ${uri}\n`);

        // Safely update .env.local with the new URI
        const envPath = path.resolve(process.cwd(), '.env.local');
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        if (envContent.includes('MONGODB_URI=')) {
            envContent = envContent.replace(/MONGODB_URI=.*/g, `MONGODB_URI=${uri}`);
        } else {
            envContent += `\nMONGODB_URI=${uri}\n`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Injected MONGODB_URI into .env.local');
        console.log('🚀 Next.js is starting...\n');

        // Keep the process alive and handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down local MongoDB...');
            await mongod.stop();
            process.exit(0);
        });
    } catch (err) {
        console.error('❌ Failed to start local MongoDB:', err);
        process.exit(1);
    }
})();
