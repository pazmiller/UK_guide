import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { ChangeRequest } from '../lib/contributions/change-contract';
import { judgeOnlyFailure, parseEvaluationComment, REPORT_PREFIX, type EvaluationReport } from '../lib/contributions/evaluation';

export const submissionPayload = '{"version":1,"details":"new"}';
export const approvedRequest: ChangeRequest = { version: 1, issueNumber: 24, submissionHash: createHash( 'sha256' ).update( submissionPayload ).digest( 'hex' ), baseSha: 'b'.repeat( 40 ), actor: 'editor', approvedAt: '2026-09-13T00:00:00.000Z', target: { city: 'wiltshire', region: 'uk', category: 'attraction', id: 'wiltshire-attraction-avebury', name: 'Avebury', section: 'Wiltshire｜威尔特郡（景点）', sourcePath: 'src/DATA.json' }, operation: 'update', fields: [{ field: 'summary', before: 'old', after: 'new' }] };
export const report: EvaluationReport = {
  version: 1, issueNumber: 24, pullRequestNumber: 26,
  headSha: 'a'.repeat( 40 ), baseSha: 'b'.repeat( 40 ), runId: '123', evaluatedAt: '2026-09-13T00:00:00.000Z',
  deterministicPassed: true, sourceRecall: 1, dynamicCasePassed: true,
  judgeScores: [ 90.14, 88.96 ], judgeAverage: 89.55, threshold: 95,
  failures: [ 'Judge average 89.55% is below 95%' ], explanation: 'AI 评分说明：回答包含未被上下文支持的内容。',
  fidelity: { requestHash: createHash( 'sha256' ).update( JSON.stringify( approvedRequest ) ).digest( 'hex' ), submissionHash: approvedRequest.submissionHash, target: approvedRequest.target, fields: approvedRequest.fields, result: { verdict: 'pass', explanation: '一致', issues: [] } },
};

test( 'only the isolated judge threshold failure can be overridden', () => {
  assert.equal( judgeOnlyFailure( report ), true );
  for ( const changes of [ { deterministicPassed: false }, { sourceRecall: 0.79 }, { dynamicCasePassed: false }, { judgeAverage: 95 }, { judgeScores: [ 0, 0 ] as [number, number] }, { failures: [] }, { failures: [...report.failures, 'Judge run 2: timeout'] } ] ) {
    assert.equal( judgeOnlyFailure( { ...report, ...changes } ), false );
  }
} );

test( 'wire records fail closed and both repositories share the same contract', async () => {
  assert.deepEqual( parseEvaluationComment( `${REPORT_PREFIX}${JSON.stringify( report )} -->` ), report );
  for ( const invalid of [ 'broken', '{}', JSON.stringify( { ...report, threshold: 80 } ), JSON.stringify( { ...report, judgeScores: [90] } ), JSON.stringify( { ...report, judgeAverage: null } ) ] ) {
    assert.equal( parseEvaluationComment( `${REPORT_PREFIX}${invalid} -->` ), null );
  }
  if ( existsSync( '.agent-automation/src/evaluation-report.ts' ) ) assert.equal( ( await readFile( 'lib/contributions/evaluation.ts', 'utf8' ) ).replace( "'./change-contract'", "'./change-contract.js'" ), await readFile( '.agent-automation/src/evaluation-report.ts', 'utf8' ) );
} );
