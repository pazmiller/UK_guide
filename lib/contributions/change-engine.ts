import ts from 'typescript';
import { fieldLabels, normalizeExact, type ChangeField, type ChangeRequest, type ChangeTarget } from './change-contract';

export type Files = Record<string, string>;
export type Candidate = { target: ChangeTarget; fields: Partial<Record<ChangeField, string>> };
type Chunk = { city: string; category: string; section: string; title: string };
type Entry = { id: string; name: string; [key: string]: unknown };
type City = { slug: string; country: 'uk' | 'europa'; nameEn: string; restaurants: Entry[]; cafes?: Entry[]; attractions?: Entry[] };
const labels = new Set<string>( Object.values( fieldLabels ) );
// JSON object key order is not content; array order and string bytes remain significant.
function orderedJson( value: unknown ) {
  return JSON.stringify( value, ( _key, item ) => item && typeof item === 'object' && !Array.isArray( item )
    ? Object.fromEntries( Object.keys( item ).sort().map( key => [key, item[key]] ) ) : item );
}
const propName = ( node: ts.PropertyName ) => ts.isIdentifier( node ) || ts.isStringLiteral( node ) ? node.text : '';
function prop( object: ts.ObjectLiteralExpression, key: string ) {
  return object.properties.find( ( node ): node is ts.PropertyAssignment => ts.isPropertyAssignment( node ) && propName( node.name ) === key );
}
function stringProp( object: ts.ObjectLiteralExpression, key: string ) {
  const value = prop( object, key )?.initializer;
  return value && ts.isStringLiteralLike( value ) ? value.text : '';
}
export function legacyObjects( source: string ) {
  const file = ts.createSourceFile( 'city.ts', source, ts.ScriptTarget.Latest, true );
  const result: ts.ObjectLiteralExpression[] = [];
  const walk = ( node: ts.Node ) => { if ( ts.isObjectLiteralExpression( node ) ) result.push( node ); ts.forEachChild( node, walk ); };
  walk( file );
  return result;
}

function block( markdown: string, target: ChangeTarget ) {
  const lines = normalizeExact( markdown ).split( '\n' );
  const sectionStarts = lines.flatMap( ( line, index ) => line.trim().replace( /[：:]\s*$/, '' ) === target.section ? [index] : [] );
  if ( sectionStarts.length !== 1 ) throw new Error( 'Canonical section is not unique; manual mapping required.' );
  const start = sectionStarts[0] + 1;
  let end = lines.length;
  for ( let i = start; i < lines.length; i++ ) {
    // Field content is not a section heading, even when it begins with 推荐.
    if ( /^\s*(条目标识|简介|菜系|推荐原因|推荐菜|价位|价格|地址|链接|网站|邮编|营业时间|图片|避雷原因|原因|备注)：/.test( lines[i] ) ) continue;
    if ( lines[i].includes( '｜' ) || /\s\|\s/.test( lines[i] ) || /^(伦敦景点|伦敦避雷|UK 性价比|推荐|避雷|其他|长期居住|致谢名单)/.test( lines[i] ) ) { end = i; break; }
  }
  const titles = lines.flatMap( ( line, i ) => i >= start && i < end && line.trim().replace( /[：:]\s*$/, '' ) === target.name ? [i] : [] );
  if ( titles.length !== 1 ) throw new Error( 'Canonical entry is not unique; manual mapping required.' );
  const title = titles[0];
  let stop = title + 1;
  for ( ; stop < end; stop++ ) {
    const line = lines[stop];
    if ( !line.trim() ) continue;
    if ( !/^(条目标识|简介|菜系|推荐原因|推荐菜|价位|价格|地址|链接|网站|邮编|营业时间|图片|避雷原因|原因|备注)：/.test( line.trim() ) ) break;
  }
  return { lines, title, stop };
}
export function readFields( markdown: string, target: ChangeTarget ): Partial<Record<ChangeField, string>> {
  const { lines, title, stop } = block( markdown, target );
  const fields: Partial<Record<ChangeField, string>> = {};
  for ( const line of lines.slice( title + 1, stop ) ) {
    const match = line.match( /^\s*([^：]+)： ?(.*)$/ );
    if ( !match || !labels.has( match[1] ) ) continue;
    const key = ( Object.keys( fieldLabels ) as ChangeField[] ).find( key => fieldLabels[key] === match[1] )!;
    fields[key] = fields[key] === undefined ? match[2] : fields[key] + '\n' + match[2];
  }
  return fields;
}
export function candidates( files: Files ): Candidate[] {
  const generated = JSON.parse( files['src/DATA.json'] ) as { cities: City[]; chunks: Chunk[] };
  const cities = [...generated.cities];
  const legacy: Array<{ city: City; file: string }> = [];
  for ( const [file, source] of Object.entries( files ) ) {
    if ( !file.endsWith( '.ts' ) || !file.startsWith( 'data/' ) ) continue;
    for ( const object of legacyObjects( source ) ) {
      const slug = stringProp( object, 'slug' ), nameEn = stringProp( object, 'nameEn' );
      const country = stringProp( object, 'country' );
      if ( !slug || !nameEn || !['uk', 'europa'].includes( country ) || cities.some( city => city.slug === slug ) ) continue;
      const city: City = { slug, nameEn, country: country as City['country'], restaurants: [], cafes: [], attractions: [] };
      for ( const category of ['restaurants', 'cafes', 'attractions'] as const ) {
        const array = prop( object, category )?.initializer;
        if ( array && ts.isArrayLiteralExpression( array ) ) {
          city[category] = array.elements.filter( ts.isObjectLiteralExpression ).map( entry => ( { id: stringProp( entry, 'id' ), name: stringProp( entry, 'name' ) } ) );
        }
      }
      legacy.push( { city, file } );
    }
  }
  const result: Candidate[] = [];
  for ( const { city, file } of [...cities.map( city => ( { city, file: 'src/DATA.json' } ) ), ...legacy] ) {
    for ( const [list, category] of [['restaurants', 'restaurant'], ['cafes', 'cafe'], ['attractions', 'attraction']] as const ) {
      for ( const entry of city[list] ?? [] ) {
        if ( !entry.id || !entry.name ) continue;
        const chunks = generated.chunks.filter( chunk => chunk.city === city.nameEn && chunk.category === category && chunk.title === entry.name );
        if ( chunks.length !== 1 ) continue;
        const target: ChangeTarget = { city: city.slug, region: city.country, category, id: entry.id, name: entry.name, section: chunks[0].section, sourcePath: file };
        try { result.push( { target, fields: readFields( files['src/DATA.md'], target ) } ); } catch { /* Ambiguous entries are unavailable for automatic edits. */ }
      }
    }
  }
  return result;
}
export function findCandidate( files: Files, target: ChangeTarget ) {
  const found = candidates( files ).filter( candidate => JSON.stringify( candidate.target ) === JSON.stringify( target ) );
  if ( found.length !== 1 ) throw new Error( 'Target city/category/ID no longer resolves uniquely.' );
  return found[0];
}
function frontendValues( fields: Partial<Record<ChangeField, string>>, request: ChangeRequest ) {
  const result: Record<string, string | string[]> = {};
  for ( const change of request.fields ) {
    const value = normalizeExact( change.after );
    switch ( change.field ) {
      case 'summary': result.shortDescription = value; if ( !fields.notes && !( request.target.category === 'attraction' && fields.recommendReason ) ) result.description = value; break;
      case 'notes': result.description = value; break;
      case 'recommendReason': if ( request.target.category === 'attraction' ) { if ( !fields.notes ) result.description = value; } else result.recommendReason = value; break;
      case 'recommendSignatures': result.mustTry = splitImages( value ); break;
      case 'price': result[request.target.category === 'attraction' ? 'price' : 'priceRange'] = value; break;
      case 'cuisine': result.cuisine = value; break;
      case 'images': result.images = splitImages( value ); break;
      default: result[change.field] = value;
    }
  }
  return result;
}
export function splitImages( value: string ) { return value ? value.split( /\n|[,，;；]/ ).map( part => part.trim() ).filter( Boolean ) : []; }

function preserveLegacyImages( values: Record<string, string | string[]>, source: string, request: ChangeRequest ) {
  if ( !values.images ) return values;
  const objects = legacyObjects( source ).filter( object => stringProp( object, 'id' ) === request.target.id && stringProp( object, 'name' ) === request.target.name );
  if ( objects.length !== 1 ) throw new Error( 'Legacy image target is not unique.' );
  const images = prop( objects[0], 'images' )?.initializer;
  if ( images && ( !ts.isArrayLiteralExpression( images ) || images.elements.some( item => !ts.isStringLiteralLike( item ) ) ) ) throw new Error( 'Legacy images require manual mapping.' );
  const old = images && ts.isArrayLiteralExpression( images ) ? images.elements.map( item => ( item as ts.StringLiteralLike ).text ) : [];
  return { ...values, images: [...new Set( [...old, ...values.images] )] };
}

export function expectedFiles( before: Files, request: ChangeRequest ): Files {
  const candidate = findCandidate( before, request.target );
  for ( const change of request.fields ) {
    if ( normalizeExact( candidate.fields[change.field] ?? '' ) !== normalizeExact( change.before ) )
      throw new Error( 'Approved old value changed: ' + change.field );
    if ( change.field === 'images' ) {
      const old = splitImages( change.before ), next = splitImages( change.after );
      if ( new Set( next ).size !== next.length || old.some( ( image, index ) => next[index] !== image ) )
        throw new Error( 'Image edits must preserve existing order and append unique images.' );
    }
  }
  const output = { ...before };
  const { lines, title, stop } = block( before['src/DATA.md'], request.target );
  const replacements = new Map( request.fields.map( item => [fieldLabels[item.field], normalizeExact( item.after )] ) );
  const written = new Set<string>();
  const body: string[] = [];
  for ( const line of lines.slice( title + 1, stop ) ) {
    const label = line.trim().split( '：' )[0];
    if ( !replacements.has( label as typeof fieldLabels[ChangeField] ) ) { body.push( line ); continue; }
    if ( !written.has( label ) ) for ( const value of replacements.get( label as typeof fieldLabels[ChangeField] )!.split( '\n' ) ) body.push( label + '： ' + value );
    written.add( label );
  }
  for ( const [label, value] of replacements ) if ( !written.has( label ) ) body.unshift( ...value.split( '\n' ).map( line => label + '： ' + line ) );
  output['src/DATA.md'] = [...lines.slice( 0, title + 1 ), ...body, ...lines.slice( stop )].join( '\n' );
  if ( request.target.sourcePath !== 'src/DATA.json' ) {
    const file = request.target.sourcePath, source = before[file];
    const objects = legacyObjects( source ).filter( object => stringProp( object, 'id' ) === request.target.id && stringProp( object, 'name' ) === request.target.name );
    if ( objects.length !== 1 ) throw new Error( 'Legacy ID is not unique.' );
    const object = objects[0], edits: Array<{ start: number; end: number; value: string }> = [];
    for ( const [key, value] of Object.entries( preserveLegacyImages( frontendValues( { ...candidate.fields, ...Object.fromEntries( request.fields.map( item => [item.field, item.after] ) ) }, request ), source, request ) ) ) {
      const property = prop( object, key );
      if ( property ) edits.push( { start: property.initializer.getStart(), end: property.initializer.end, value: JSON.stringify( value ) } );
      else edits.push( { start: object.getStart() + 1, end: object.getStart() + 1, value: '\n' + key + ': ' + JSON.stringify( value ) + ',' } );
    }
    output[file] = edits.sort( ( a, b ) => b.start - a.start ).reduce( ( text, edit ) => text.slice( 0, edit.start ) + edit.value + text.slice( edit.end ), source );
  }
  return output;
}
export function validateExactFiles( actual: Files, expected: Files ) {
  for ( const file of Object.keys( expected ) ) {
    if ( file === 'src/DATA.json' ) continue;
    if ( normalizeExact( actual[file] ?? '' ) !== normalizeExact( expected[file] ) ) throw new Error( 'Unauthorized or missing change in ' + file );
  }
}
export function expectedFrontendValues( request: ChangeRequest, baseline: Files ) {
  const fields = readFields( baseline['src/DATA.md'], request.target );
  const values = frontendValues( { ...fields, ...Object.fromEntries( request.fields.map( item => [item.field, item.after] ) ) }, request );
  return request.target.sourcePath === 'src/DATA.json' ? values : preserveLegacyImages( values, baseline[request.target.sourcePath], request );
}

export function validateGeneratedFields( actual: Files, baseline: Files, request: ChangeRequest ) {
  const after = JSON.parse( actual['src/DATA.json'] );
  const before = JSON.parse( baseline['src/DATA.json'] );
  const matches = ( chunk: Chunk ) => chunk.section === request.target.section && chunk.title === request.target.name && chunk.category === request.target.category;
  const targets = after.chunks.filter( matches ), oldTargets = before.chunks.filter( matches );
  if ( targets.length !== 1 || oldTargets.length !== 1 ) throw new Error( 'Generated target is not unique.' );
  const target = targets[0], oldTarget = oldTargets[0];
  const contentKeys: Partial<Record<ChangeField, string>> = { summary: 'summary', cuisine: 'type_cusine', price: 'price', recommendReason: 'recommend_reason', recommendSignatures: 'recommend_signatures' };
  const detailKeys: Partial<Record<ChangeField, string>> = { address: 'address', website: 'website', openingHours: 'opening_hours', notes: 'notes', images: 'images' };
  for ( const field of request.fields ) {
    let value: unknown;
    if ( typeof target.content === 'string' ) {
      const prefix = fieldLabels[field.field] + '：';
      value = target.content.split( '\n' ).filter( ( line: string ) => line.startsWith( prefix ) ).map( ( line: string ) => line.slice( prefix.length ).replace( /^ /, '' ) ).join( '\n' );
    } else {
      const key = contentKeys[field.field];
      value = key ? target.content[key] : target.details?.[detailKeys[field.field]!];
    }
    if ( ( value ?? '' ) !== normalizeExact( field.after ) ) throw new Error( 'Generated field lost or rewrote approved content: ' + field.field );
  }
  const clone = structuredClone( after );
  clone.generatedAt = before.generatedAt;
  const targetIndex = clone.chunks.findIndex( matches );
  const maskedTarget = structuredClone( target );
  if ( typeof target.content === 'string' ) {
    const changedLabels = new Set( request.fields.map( item => fieldLabels[item.field] ) );
    const strip = ( content: string ) => content.split( '\n' ).filter( line => !changedLabels.has( line.split( '：' )[0] as typeof fieldLabels[ChangeField] ) ).join( '\n' );
    if ( strip( target.content ) !== strip( oldTarget.content ) ) throw new Error( 'Generated target changed unapproved content.' );
    maskedTarget.content = oldTarget.content;
  } else {
    for ( const field of request.fields ) {
      const key = contentKeys[field.field] || detailKeys[field.field]!;
      const group = contentKeys[field.field] ? 'content' : 'details';
      if ( Object.hasOwn( oldTarget[group] || {}, key ) ) maskedTarget[group][key] = oldTarget[group][key];
      else if ( maskedTarget[group] ) { delete maskedTarget[group][key]; if ( !Object.keys( maskedTarget[group] ).length && !oldTarget[group] ) delete maskedTarget[group]; }
    }
  }
  if ( orderedJson( maskedTarget ) !== orderedJson( oldTarget ) ) throw new Error( 'Generated target changed unapproved fields.' );
  clone.chunks[targetIndex] = oldTarget;
  // Only specified frontend properties may change on the target entry.
  const city = clone.cities.find( ( city: City ) => city.slug === request.target.city );
  const oldCity = before.cities.find( ( city: City ) => city.slug === request.target.city );
  if ( city && oldCity ) {
    const list = request.target.category === 'attraction' ? 'attractions' : request.target.category === 'cafe' ? 'cafes' : 'restaurants';
    const entry = city[list].find( ( entry: Entry ) => entry.id === request.target.id );
    const oldEntry = oldCity[list].find( ( entry: Entry ) => entry.id === request.target.id );
    if ( !entry || !oldEntry ) throw new Error( 'Generated frontend ID changed.' );
    const values = expectedFrontendValues( request, baseline );
    for ( const [key, value] of Object.entries( values ) ) {
      if ( JSON.stringify( entry[key] ?? '' ) !== JSON.stringify( value ) ) throw new Error( 'Generated page value differs: ' + key );
      if ( Object.hasOwn( oldEntry, key ) ) entry[key] = oldEntry[key]; else delete entry[key];
    }
  }
  if ( orderedJson( clone ) !== orderedJson( before ) ) throw new Error( 'Generated data changed other fields or entries.' );
}
