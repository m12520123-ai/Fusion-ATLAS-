import {existsSync,readFileSync} from 'node:fs';
const required=['site/index.html','site/atlas-app.mjs','site/atlas-ui.css','site/atlas-store.mjs','site/atlas-engine.js','site/atlas-catalog.mjs','server/functions/atlas.mjs','server/lib/data.mjs','server/lib/yahoo.mjs'];
for(const path of required){if(!existsSync(path))throw new Error('Missing '+path+'; upload the CONTENTS of the zip to repository root.');}
const html=readFileSync('site/index.html','utf8');if(html.includes('src="./app.js"'))throw new Error('Old frontend entry found');
console.log('ATLAS 10: frontend and function files verified. API custom path /api/atlas/*; no redirect required.');
