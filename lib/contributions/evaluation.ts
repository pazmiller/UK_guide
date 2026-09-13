import { z } from 'zod';

const score = z.number().min( 0 ).max( 100 );
export const evaluationReportSchema = z.object( {
  version: z.literal( 1 ),
  issueNumber: z.number().int().positive(),
  pullRequestNumber: z.number().int().positive(),
  headSha: z.string().regex( /^[a-f0-9]{40}$/ ),
  baseSha: z.string().regex( /^[a-f0-9]{40}$/ ),
  runId: z.string().regex( /^\d+$/ ),
  evaluatedAt: z.string().datetime(),
  deterministicPassed: z.boolean(),
  sourceRecall: z.number().min( 0 ).max( 1 ),
  dynamicCasePassed: z.boolean(),
  judgeScores: z.tuple( [ score, score ] ),
  judgeAverage: score,
  threshold: z.literal( 95 ),
  failures: z.array( z.string().max( 2000 ) ).max( 30 ),
  explanation: z.string().max( 2000 ),
} );
export type EvaluationReport = z.infer<typeof evaluationReportSchema>;
export const REPORT_PREFIX = '<!-- agent-evaluation-v1:';

export function judgeOnlyFailure( report: EvaluationReport ): boolean
{
  return report.deterministicPassed && report.sourceRecall >= 0.8 && report.dynamicCasePassed
    && report.judgeAverage < report.threshold
    && Math.abs( report.judgeAverage - ( report.judgeScores[0] + report.judgeScores[1] ) / 2 ) < 0.000001
    && report.failures.length === 1
    && report.failures[0] === `Judge average ${report.judgeAverage.toFixed( 2 )}% is below 95%`;
}

export function parseEvaluationComment( body: string ): EvaluationReport | null
{
  const start = body.indexOf( REPORT_PREFIX );
  if ( start < 0 ) return null;
  const end = body.indexOf( ' -->', start );
  if ( end < 0 ) return null;
  try {
    const parsed = evaluationReportSchema.safeParse( JSON.parse( body.slice( start + REPORT_PREFIX.length, end ) ) );
    return parsed.success ? parsed.data : null;
  } catch { return null; }
}

