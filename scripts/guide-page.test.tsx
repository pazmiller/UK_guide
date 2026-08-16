import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import GuideBookPage from '../app/guide/GuideBookPage';

test( 'renders reviewed community Guides after the eleven fixed chapters', () =>
{
  const html = renderToStaticMarkup( <GuideBookPage contributions={[ {
    id: 'guide-61',
    sourceIssueNumber: 61,
    title: '雨天参观提示',
    body: '提前预约热门博物馆。',
    city: 'London',
    region: 'uk',
    sourceUrl: '',
    images: [],
  } ]} /> );

  assert.match( html, /12\. 雨天参观提示/ );
  assert.match( html, /提前预约热门博物馆。/ );
  assert.match( html, /社区补充/ );
} );
