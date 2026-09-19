import { z } from 'zod';

export const fieldLabels = {
  summary: '简介', recommendReason: '推荐原因', recommendSignatures: '推荐菜',
  price: '价位', cuisine: '菜系', address: '地址', openingHours: '营业时间',
  website: '网站', notes: '备注', images: '图片',
} as const;
export const changeFieldSchema = z.enum( Object.keys( fieldLabels ) as [keyof typeof fieldLabels, ...Array<keyof typeof fieldLabels>] );
export type ChangeField = z.infer<typeof changeFieldSchema>;
export const targetSchema = z.object( {
  city: z.string().min( 1 ).max( 120 ),
  region: z.enum( ['uk', 'europa'] ),
  category: z.enum( ['restaurant', 'cafe', 'attraction'] ),
  id: z.string().min( 1 ).max( 180 ),
  name: z.string().min( 1 ).max( 120 ),
  section: z.string().min( 1 ).max( 200 ),
  sourcePath: z.string().regex( /^(?:src\/DATA.json|data\/[a-zA-Z0-9_/-]+\.ts)$/ ),
} ).strict();
export const changeRequestSchema = z.object( {
  version: z.literal( 1 ),
  issueNumber: z.number().int().positive(),
  submissionHash: z.string().regex( /^[a-f0-9]{64}$/ ),
  baseSha: z.string().regex( /^[a-f0-9]{40}$/ ),
  actor: z.string().min( 1 ).max( 100 ),
  approvedAt: z.string().datetime(),
  target: targetSchema,
  operation: z.enum( ['update', 'image'] ),
  fields: z.array( z.object( {
    field: changeFieldSchema,
    before: z.string().max( 10000 ),
    after: z.string().max( 10000 ),
  } ).strict() ).min( 1 ).max( 11 ),
} ).strict().superRefine( ( value, context ) => {
  if ( new Set( value.fields.map( item => item.field ) ).size !== value.fields.length )
    context.addIssue( { code: 'custom', message: 'Duplicate fields.' } );
  if ( value.operation === 'image' && value.fields.some( item => item.field !== 'images' ) )
    context.addIssue( { code: 'custom', message: 'Image submissions may only append images.' } );
  if ( value.target.category === 'attraction' && value.fields.some( item => ['cuisine', 'recommendSignatures'].includes( item.field ) ) )
    context.addIssue( { code: 'custom', message: 'Restaurant-only fields cannot be changed on an attraction.' } );
  if ( value.target.category === 'cafe' && value.fields.some( item => item.field === 'cuisine' && !['Drinks', 'Dessert'].includes( item.after ) ) )
    context.addIssue( { code: 'custom', message: 'Cafe cuisine must be Drinks or Dessert.' } );
} );
export type ChangeRequest = z.infer<typeof changeRequestSchema>;
export type ChangeTarget = z.infer<typeof targetSchema>;
// A contributor selects an existing record; this is a request, never admin approval.
export const existingEditSchema = z.object( {
  target: targetSchema,
  before: z.record( changeFieldSchema, z.string().max( 10000 ) ),
  changes: z.array( z.object( {
    field: changeFieldSchema,
    after: z.string().max( 10000 ),
  } ).strict() ).max( 9 ),
} ).strict().superRefine( ( value, ctx ) => {
  if ( new Set( value.changes.map( item => item.field ) ).size !== value.changes.length || value.changes.some( item => item.field === 'images' ) )
    ctx.addIssue( { code: 'custom', message: '图片只能通过上传补充；修改字段不得重复。' } );
} );
export type ExistingEdit = z.infer<typeof existingEditSchema>;
export const CHANGE_PREFIX = '<!-- approved-change-v1:';
export const normalizeExact = ( value: string ) => value.replaceAll( '\r\n', '\n' );

export const fidelitySchema = z.object( {
  verdict: z.enum( ['pass', 'review', 'fail'] ),
  explanation: z.string().min( 1 ).max( 1500 ),
  issues: z.array( z.object( {
    field: changeFieldSchema, before: z.string().max( 300 ),
    submitted: z.string().max( 300 ), after: z.string().max( 300 ),
    reason: z.string().min( 1 ).max( 400 ),
  } ).strict() ).max( 11 ),
} ).strict();
export const fidelityReportSchema = z.object( {
  requestHash: z.string().regex( /^[a-f0-9]{64}$/ ),
  submissionHash: z.string().regex( /^[a-f0-9]{64}$/ ),
  target: targetSchema,
  fields: changeRequestSchema.shape.fields,
  result: fidelitySchema,
} );
export type FidelityReport = z.infer<typeof fidelityReportSchema>;
