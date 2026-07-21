import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify( execFile );

async function readGeneratedFile( path )
{
  const data = JSON.parse( await readFile( path, 'utf8' ) );
  delete data.generatedAt;
  return data;
}

const beforeData = await readGeneratedFile( 'src/DATA.json' );
const beforeRag = await readGeneratedFile( 'data/rag-knowledge-base.json' );

await execFileAsync( 'npm', [ 'run', 'build:data' ] );
await execFileAsync( 'npm', [ 'run', 'build:rag' ] );

assert.deepEqual(
  await readGeneratedFile( 'src/DATA.json' ),
  beforeData,
  'src/DATA.json is stale. Run npm run build:data and commit the result.',
);
assert.deepEqual(
  await readGeneratedFile( 'data/rag-knowledge-base.json' ),
  beforeRag,
  'data/rag-knowledge-base.json is stale. Run npm run build:rag and commit the result.',
);

console.log( 'Generated content data is current.' );
