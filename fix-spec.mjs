/**
 * Patches OpenAPI specs for orval compatibility:
 * - Downgrades openapi version to 3.0.3
 * - Removes 'style' from response headers (invalid in 3.0)
 * - Simplifies 302 redirect response Location headers
 *
 * Usage:
 *   node fix-spec.mjs           # patches the OAuth spec
 *   node fix-spec.mjs --data    # patches the data API spec
 */
import { readFileSync, writeFileSync } from 'fs';

const isData = process.argv.includes('--data');
const file = isData
    ? 'app/dashboard/test/data-api-docs.json'
    : 'app/auth/test/api-docs-v2.json';

const spec = JSON.parse(readFileSync(file, 'utf8'));

function removeStyle(obj) {
    if (typeof obj !== 'object' || obj === null) return;
    for (const key of Object.keys(obj)) {
        if (key === 'style' && typeof obj[key] === 'string') {
            delete obj[key];
        } else {
            removeStyle(obj[key]);
        }
    }
}

function fix302Responses(obj) {
    if (typeof obj !== 'object' || obj === null) return;
    if (obj['302']?.headers?.Location) {
        obj['302'].headers.Location = {
            description: obj['302'].headers.Location.description ?? 'Redirect URL',
            schema: { type: 'string' }
        };
    }
    for (const val of Object.values(obj)) {
        fix302Responses(val);
    }
}

removeStyle(spec);
if (spec.paths) fix302Responses(spec.paths);
spec.openapi = '3.0.3';

writeFileSync(file, JSON.stringify(spec, null, 2));
console.log(`Patched ${file}`);
