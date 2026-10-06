import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import GuideBookPage from '../app/guide/GuideBookPage';

test( 'renders the supplied provisional licence copy and the Furcon link', () =>
{
  const html = renderToStaticMarkup( <GuideBookPage contributions={[]} /> );
  assert.match( html, /14\. 申请一张临时驾照学习卡/ );
  assert.match( html, /£34/ );
  assert.match( html, /href="\/furcon"/ );
  assert.match( html, /严格以实体卡为主/ );
  assert.match( html, /Digital Driving Licence/ );
  assert.match( html, /https:\/\/www.gov.uk\/apply-first-provisional-driving-licence/ );
  // The GOV.UK button reads 官方申请临时驾照 (never 「…的链接」 since it was added in 6192c57)
  assert.match( html, /官方申请临时驾照/ );
} );

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
  // Community chapters carry the group's own badge (renamed from 社区补充 in 14e3b10)
  assert.match( html, /群“大头”补充/ );
} );
