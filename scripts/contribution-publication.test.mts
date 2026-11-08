import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';

const result = await build({stdin:{contents:"export * from './lib/server/contributionPublication';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',plugins:[{name:'offline-github',setup(builder){
  builder.onResolve({filter:/^(server-only|\.\/githubApp)$/},args=>({path:args.path,namespace:'mock'}));
  builder.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:args.path==='server-only'?'':'export const githubRequest = (...args) => globalThis.publicationRequest(...args);'}));
}}]});
const bundled={exports:{}};
new Function('require','module','exports',result.outputFiles[0].text)(createRequire(import.meta.url),bundled,bundled.exports);
const service=bundled.exports as typeof import('../lib/server/contributionPublication');
const sha='a'.repeat(40), deployed='b'.repeat(40);
const pr={number:40,state:'closed',draft:false,merged:true,merge_commit_sha:sha,mergeable:true,mergeable_state:'clean',head:{ref:'agent/submission-26',repo:{full_name:'owner/public'}},base:{ref:'master',repo:{full_name:'owner/public'}}};
async function scenario(overrides:Partial<typeof pr>,state:string,comparison:string,run:(value:Awaited<ReturnType<typeof service.loadContributionPublication>>)=>void){
  const old=process.env.PUBLIC_GITHUB_REPOSITORY;
  process.env.PUBLIC_GITHUB_REPOSITORY='owner/public';
  const target={...pr,...overrides};
  (globalThis as unknown as {publicationRequest:(path:string)=>Promise<unknown>}).publicationRequest=async path=>{
    if(path.includes('/compare/')) return {status:comparison};
    if(path.endsWith('/pulls/40')) return target;
    if(path.includes('/pulls?')) return [target];
    throw new Error('Unexpected read '+path);
  };
  try {run(await service.loadContributionPublication(26,1,async()=>({deployment:{id:5,sha:deployed,production_environment:true,transient_environment:false,environment:'Production',created_at:'2026-11-07'},status:{state,environment_url:'https://site.example'}})));}
  finally {if(old===undefined) delete process.env.PUBLIC_GITHUB_REPOSITORY; else process.env.PUBLIC_GITHUB_REPOSITORY=old;}
}
test('deployed ancestor evidence is required',async()=>{
  await scenario({},'success','ahead',value=>assert.equal(value.state,'live'));
  await scenario({},'success','behind',value=>assert.equal(value.state,'merged'));
  await scenario({},'success','diverged',value=>assert.equal(value.state,'merged'));
});
test('pending, failed and inactive production are not online',async()=>{
  await scenario({},'pending','ahead',value=>assert.equal(value.state,'merged'));
  await scenario({},'failure','ahead',value=>assert.equal(value.state,'deployment-failed'));
  await scenario({},'inactive','ahead',value=>assert.equal(value.state,'merged'));
});
test('open PRs must be non-draft, clean and mergeable',async()=>{
  await scenario({state:'open',merged:false},'success','ahead',value=>assert.equal(value.state,'ready'));
  await scenario({state:'open',merged:false,draft:true},'success','ahead',value=>assert.equal(value.state,'draft'));
  await scenario({state:'open',merged:false,mergeable_state:'blocked'},'success','ahead',value=>assert.equal(value.state,'blocked'));
});
test('revision and repository mismatches are never adopted',async()=>{
  await scenario({head:{...pr.head,ref:'agent/submission-26-r2'}},'success','ahead',value=>assert.equal(value.state,'unknown'));
  await scenario({head:{...pr.head,repo:{full_name:'someone/fork'}}},'success','ahead',value=>assert.equal(value.state,'unknown'));
});

test('production evidence selects the latest production deployment, not a preview or an older success',async()=>{
  const old=process.env.PUBLIC_GITHUB_REPOSITORY;
  process.env.PUBLIC_GITHUB_REPOSITORY='owner/public';
  const requested:string[]=[];
  const base={sha:deployed,production_environment:true,transient_environment:false,environment:'Production'};
  (globalThis as unknown as {publicationRequest:(path:string)=>Promise<unknown>}).publicationRequest=async path=>{
    requested.push(path);
    if(path.endsWith('/deployments?per_page=100')) return [
      {...base,id:1,created_at:'2026-11-01T00:00:00Z'},
      {...base,id:3,production_environment:false,created_at:'2026-11-03T00:00:00Z'},
      {...base,id:2,created_at:'2026-11-02T00:00:00Z'},
    ];
    if(path.endsWith('/deployments/2/statuses?per_page=1')) return [{state:'pending'}];
    throw new Error('Unexpected read '+path);
  };
  try {
    const evidence=await service.latestProductionEvidence();
    assert.equal(evidence?.deployment.id,2);
    assert.equal(evidence?.status?.state,'pending');
    assert.equal(requested.length,2);
  } finally {if(old===undefined) delete process.env.PUBLIC_GITHUB_REPOSITORY; else process.env.PUBLIC_GITHUB_REPOSITORY=old;}
});

test('missing deployment permission does not turn a merged PR into a failed submission or live site',async()=>{
  const old=process.env.PUBLIC_GITHUB_REPOSITORY;
  process.env.PUBLIC_GITHUB_REPOSITORY='owner/public';
  (globalThis as unknown as {publicationRequest:(path:string)=>Promise<unknown>}).publicationRequest=async path=>{
    if(path.includes('/pulls?')) return [pr];
    if(path.endsWith('/pulls/40')) return pr;
    throw new Error('Unexpected read '+path);
  };
  try {
    const publication=await service.loadContributionPublication(26,1,async()=>{throw new Error('403 Forbidden');});
    assert.equal(publication.state,'merged');
    assert.match(publication.message,/只读权限/);
    assert.equal(publication.deploymentUrl,undefined);
  } finally {if(old===undefined) delete process.env.PUBLIC_GITHUB_REPOSITORY; else process.env.PUBLIC_GITHUB_REPOSITORY=old;}
});
