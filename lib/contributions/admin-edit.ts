import { z } from 'zod';
import { contributionSubmissionSchema } from './schema';
import { existingEditSchema } from './change-contract';

const fields = contributionSubmissionSchema.shape;
export const adminSubmissionEditsSchema = z.object( {
  name: fields.name.optional(), city: fields.city.removeDefault().optional(), region: fields.region.removeDefault().optional(),
  details: fields.details.optional(), sourceUrl: fields.sourceUrl.removeDefault().optional(),
  cuisine: fields.cuisine.removeDefault().optional(), customCuisine: fields.customCuisine.removeDefault().optional(),
  price: fields.price.removeDefault().optional(), recommendReason: fields.recommendReason.removeDefault().optional(),
  recommendSignatures: fields.recommendSignatures.removeDefault().optional(),
  studyStartYear: fields.studyStartYear.removeDefault().regex( /^(?:19[0-9]{2}|20[0-9]{2})?$/, '请填写四位有效年份。' ).optional(),
  studyEndYear: fields.studyEndYear.removeDefault().refine( value => /^(?:(?:19|20)[0-9]{2}|至今)?$/.test( value ), '请填写四位有效年份或“至今”。' ).optional(),
  studyStage: fields.studyStage.removeDefault().optional(), studyProgram: fields.studyProgram.removeDefault().optional(),
  universityPros: fields.universityPros.removeDefault().optional(), universityCons: fields.universityCons.removeDefault().optional(), rating: fields.rating.removeDefault().optional(),
  existingChanges: existingEditSchema.shape.changes.optional(),
} ).strict();
export type AdminSubmissionEdits = z.infer<typeof adminSubmissionEditsSchema>;
export const editableSubmissionStatuses = ['status:submitted', 'status:failed', 'status:manual-review', 'status:manual-ready', 'status:ready'];
