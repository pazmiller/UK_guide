import { z } from 'zod';

export const contributionTypes = [ 'restaurant', 'attraction', 'avoid', 'tip', 'university' ] as const;
export const contributionIntents = [ 'add', 'update', 'closure', 'image', 'other' ] as const;
export const contributionRegions = [ 'uk', 'europa' ] as const;
export const contributionImageTypes = [ 'image/jpeg', 'image/png', 'image/webp' ] as const;
export const universityStudyStages = [ '本科', '硕士', '博士', '博士后', '教职' ] as const;
export const tipRoutingOptions = [ 'guide', 'agent' ] as const;
export const tipRoutingSchema = z.enum( tipRoutingOptions );
export const restaurantCuisineOptions = [
  'American',
  'Brazilian',
  'British',
  'Burmese',
  'Chinese',
  'Danish',
  'Dessert',
  'Drinks',
  'French',
  'Greek',
  'Icelandic',
  'Indian',
  'Indonesian',
  'Italian',
  'Japanese',
  'Malaysian',
  'Mediterranean',
  'Persian',
  'Peruvian',
  'Polish',
  'Russian',
  'Spanish',
  'Swedish',
  'Thai',
  'Vietnamese',
  'Other',
] as const;

export const MAX_CONTRIBUTION_IMAGES = 5;
export const MAX_CONTRIBUTION_IMAGE_BYTES = 10 * 1024 * 1024;

const optionalHttpUrl = z.string().trim().max( 500 ).refine( value => {
  if ( !value ) return true;

  try
  {
    const url = new URL( value );
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch
  {
    return false;
  }
}, '链接需要以 http:// 或 https:// 开头。' );

const customCuisineName = z.string()
  .trim()
  .max( 60 )
  .refine(
    value => !value || /^[A-Za-z][A-Za-z '&/().-]*$/.test( value ),
    '请使用英文填写菜系名称。',
  );

export const contributionSubmissionSchema = z.object( {
  version: z.literal( 1 ).default( 1 ),
  type: z.enum( contributionTypes ),
  intent: z.enum( contributionIntents ),
  region: z.enum( contributionRegions ).default( 'uk' ),
  name: z.string().trim().min( 1 ).max( 120 ),
  city: z.string().trim().max( 100 ).default( '' ),
  details: z.string().trim().min( 1 ).max( 4000 ),
  cuisine: z.union( [ z.enum( restaurantCuisineOptions ), z.literal( '' ) ] ).default( '' ),
  customCuisine: customCuisineName.default( '' ),
  price: z.string().trim().max( 100 ).default( '' ),
  recommendReason: z.string().trim().max( 2000 ).default( '' ),
  recommendSignatures: z.string().trim().max( 1000 ).default( '' ),
  universitySlug: z.string().trim().regex( /^(?:[a-z0-9-]+)?$/ ).max( 120 ).default( '' ),
  studyYear: z.string().trim().max( 40 ).default( '' ),
  studyStartYear: z.string().trim().max( 4 ).default( '' ),
  studyEndYear: z.string().trim().max( 4 ).or( z.literal( '至今' ) ).default( '' ),
  studyStage: z.union( [ z.enum( universityStudyStages ), z.literal( '' ) ] ).default( '' ),
  studyProgram: z.string().trim().max( 160 ).default( '' ),
  rating: z.number().min( 1 ).max( 5 ).multipleOf( .5 ).nullable().default( null ),
  discloseSubmitterName: z.boolean().default( false ),
  sourceUrl: optionalHttpUrl.default( '' ),
  submitterName: z.string().trim().max( 80 ).default( '' ),
  imageKeys: z.array( z.string().regex( /^incoming\/[a-z0-9/_-]+\.(?:jpe?g|png|webp)$/ ) )
    .max( MAX_CONTRIBUTION_IMAGES )
    .default( [] ),
  imageCaptions: z.array( z.string().trim().max( 200 ) )
    .max( MAX_CONTRIBUTION_IMAGES )
    .default( [] ),
  imageRightsConfirmed: z.boolean().default( false ),
} ).superRefine( ( submission, context ) => {
  if ( submission.type !== 'university' && !submission.city )
  {
    context.addIssue( {
      code: 'custom',
      path: [ 'city' ],
      message: '请填写城市或地区。',
    } );
  }

  if ( submission.type === 'restaurant' && submission.intent === 'add' )
  {
    if ( !submission.cuisine )
    {
      context.addIssue( {
        code: 'custom',
        path: [ 'cuisine' ],
        message: '新增餐厅时请选择菜系。',
      } );
    }
    if ( !submission.recommendReason )
    {
      context.addIssue( {
        code: 'custom',
        path: [ 'recommendReason' ],
        message: '新增餐厅时请填写推荐理由。',
      } );
    }
  }
  if ( submission.type === 'restaurant' && submission.cuisine === 'Other' && !submission.customCuisine )
  {
    context.addIssue( {
      code: 'custom',
      path: [ 'customCuisine' ],
      message: '选择 Other 后，请填写菜系的英文名称。',
    } );
  }

  if ( submission.type === 'university' )
  {
    if ( !submission.universitySlug )
    {
      context.addIssue( {
        code: 'custom',
        path: [ 'universitySlug' ],
        message: '请选择学校。',
      } );
    }
    if ( submission.imageCaptions.length !== submission.imageKeys.length )
    {
      context.addIssue( {
        code: 'custom',
        path: [ 'imageCaptions' ],
        message: '照片说明与上传图片数量不一致。',
      } );
    }
    if ( !submission.studyStartYear || !submission.studyEndYear )
    {
      context.addIssue( {
        code: 'custom',
        path: [ 'studyYear' ],
        message: '请选择开始与结束年份。',
      } );
    }
    if ( submission.studyEndYear !== '至今' && Number( submission.studyEndYear ) < Number( submission.studyStartYear ) )
    {
      context.addIssue( {
        code: 'custom',
        path: [ 'studyEndYear' ],
        message: '结束年份不能早于开始年份。',
      } );
    }
    if ( !submission.studyStage )
    {
      context.addIssue( {
        code: 'custom',
        path: [ 'studyStage' ],
        message: '请选择本科、硕士、博士、博士后或教职。',
      } );
    }
    if ( !submission.studyProgram )
    {
      context.addIssue( {
        code: 'custom',
        path: [ 'studyProgram' ],
        message: '请填写专业。',
      } );
    }
    if ( submission.rating === null )
    {
      context.addIssue( {
        code: 'custom',
        path: [ 'rating' ],
        message: '请选择 1–5 星评分。',
      } );
    }
    if ( submission.discloseSubmitterName && !submission.submitterName )
    {
      context.addIssue( {
        code: 'custom',
        path: [ 'submitterName' ],
        message: '选择署名投稿后，请填写名字。',
      } );
    }
  }

  if ( submission.imageKeys.length > 0 && !submission.imageRightsConfirmed )
  {
    context.addIssue( {
      code: 'custom',
      path: [ 'imageRightsConfirmed' ],
      message: '上传图片前需要确认版权和隐私声明。',
    } );
  }
} );

export const contributionRequestSchema = contributionSubmissionSchema.extend( {
  website: z.string().max( 200 ).default( '' ),
} );

export const contributionUploadRequestSchema = z.object( {
  fileName: z.string().trim().min( 1 ).max( 180 ),
  contentType: z.enum( contributionImageTypes ),
  size: z.number().int().positive().max( MAX_CONTRIBUTION_IMAGE_BYTES ),
} );

export type ContributionSubmission = z.infer<typeof contributionSubmissionSchema>;
export type ContributionType = typeof contributionTypes[ number ];
export type ContributionIntent = typeof contributionIntents[ number ];
export type ContributionRegion = typeof contributionRegions[ number ];
export type RestaurantCuisine = typeof restaurantCuisineOptions[ number ];
export type UniversityStudyStage = typeof universityStudyStages[ number ];
export type TipRouting = typeof tipRoutingOptions[ number ];

export const contributionTypeLabels: Record<ContributionType, string> = {
  restaurant: '餐厅 / Restaurant',
  attraction: '景点 / Attraction',
  avoid: '避雷 / Avoid',
  tip: '其他实用线索 / Helpful tip',
  university: '大学评价 / University review',
};

export const contributionIntentLabels: Record<ContributionIntent, string> = {
  add: '新增条目',
  update: '修改现有条目',
  closure: '报告停业或错误',
  image: '新增图片',
  other: '其他补充',
};

export const contributionRegionLabels: Record<ContributionRegion, string> = {
  uk: '英国 / UK',
  europa: '欧洲大陆 / Europa',
};
