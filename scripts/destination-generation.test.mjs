import assert from 'node:assert/strict';
import test from 'node:test';
import { buildKnowledgeBase } from './build-rag-kb.mjs';

const markdown = `
Brighton｜布莱顿（餐厅）
城市标识： brighton
城市描述： 海滨城市
城市封面： /contributions/99/1.webp
国家： uk
导航顺序： 80
Test Kitchen
简介： 海边小馆
菜系： British
推荐原因： 当日海鲜值得尝试
推荐菜： 烤鱼
价位： £20/人
图片： /contributions/99/2.webp

Brighton｜布莱顿（景点）
Brighton Pier
简介： 海滨栈桥
推荐原因： 适合看海
地址： Madeira Drive
图片： /contributions/99/3.webp

Brighton｜布莱顿（避雷）
Test Trap
避雷原因： 价格不透明

Brighton｜布莱顿（生活 tips）
海边天气
备注： 风大时注意保暖

Ghent｜根特（餐厅）
城市标识： ghent
城市描述： 比利时历史城市
城市封面： /contributions/100/1.webp
国家： europa
导航顺序： 70
Test Bistro
简介： 本地小馆
菜系： French
推荐原因： 菜单稳定
推荐菜： 未注明
价位： 未注明
图片： /contributions/100/2.webp
`;

test( 'generates unseen UK and Europa destinations without CITY_ALIASES entries', () =>
{
  const generated = buildKnowledgeBase( markdown );
  const brighton = generated.cities.find( city => city.slug === 'brighton' );
  const ghent = generated.cities.find( city => city.slug === 'ghent' );

  assert.ok( brighton );
  assert.equal( brighton.country, 'uk' );
  assert.equal( brighton.restaurants[ 0 ].name, 'Test Kitchen' );
  assert.equal( brighton.attractions[ 0 ].name, 'Brighton Pier' );
  assert.equal( brighton.avoids[ 0 ].reason, '价格不透明' );
  assert.equal( brighton.tips[ 0 ].content, '风大时注意保暖' );

  assert.ok( ghent );
  assert.equal( ghent.country, 'europa' );
  assert.equal( ghent.restaurants[ 0 ].name, 'Test Bistro' );
} );
