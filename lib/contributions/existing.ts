import { fieldLabels, normalizeExact, type ChangeField, type ExistingEdit } from './change-contract';
import type { Candidate } from './change-engine';

export type ExistingEntry = Candidate & {
  cityName: string;
  display: Record<string, string>;
  images: string[];
};
export const textFields = Object.keys( fieldLabels ).filter( key => key !== 'images' ) as ChangeField[];
export function completeFields( fields: Candidate['fields'] ) {
  return Object.fromEntries( Object.keys( fieldLabels ).map( key => [key, fields[key as ChangeField] ?? ''] ) ) as Record<ChangeField, string>;
}
export function validateExistingEdit( edit: ExistingEdit, entry: ExistingEntry, intent: string, type: string, region: string, name: string, city: string, imageCount: number ) {
  if ( !['update', 'image'].includes( intent ) || !['restaurant', 'attraction'].includes( type ) ) throw new Error( '此操作不支持现有条目编辑。' );
  if ( JSON.stringify( edit.target ) !== JSON.stringify( entry.target ) || entry.target.region !== region || entry.target.name !== name || entry.target.city !== city || ( type === 'attraction' ) !== ( entry.target.category === 'attraction' ) ) throw new Error( '所选条目与投稿目标不一致，请重新选择。' );
  const original = completeFields( entry.fields );
  if ( Object.keys( original ).some( key => normalizeExact( edit.before[key as ChangeField] ) !== normalizeExact( original[key as ChangeField] ) ) ) throw new Error( '原资料已更新，请重新载入条目后再提交。' );
  if ( intent === 'image' && ( edit.changes.length || !imageCount ) ) throw new Error( '补充图片只需上传新图片，不能修改文字。' );
  if ( intent === 'update' && !edit.changes.length ) throw new Error( '请先修改至少一项资料；只上传图片请选择“补充图片”。' );
  for ( const change of edit.changes ) {
    if ( change.field === 'images' || ( entry.target.category === 'attraction' && ['cuisine', 'recommendSignatures'].includes( change.field ) ) ) throw new Error( '该条目不支持此字段。' );
    if ( normalizeExact( change.after ) === normalizeExact( original[change.field] ) ) throw new Error( '无需提交未改变的字段。' );
    if ( change.field === 'website' && change.after && !/^https?:\/\//i.test( change.after ) ) throw new Error( '网站链接必须以 https:// 或 http:// 开头。' );
    if ( entry.target.category === 'cafe' && change.field === 'cuisine' && !['Drinks', 'Dessert'].includes( change.after ) ) throw new Error( 'Cafe 菜系请选择 Drinks 或 Dessert。' );
  }
}
