import {db,owner,failure} from '@/lib/server';
import {CategorySchema} from '@/lib/journal-settings';
import {imageType,MAX_CATEGORY_IMAGE_BYTES} from '@/lib/category-images';
export async function GET(){try{const user=await owner();const rows=await db().prepare('SELECT payload FROM journal_categories WHERE owner=? ORDER BY title COLLATE NOCASE,id').bind(user).all<{payload:string}>();return Response.json(rows.results.map(r=>JSON.parse(r.payload)),{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
export async function POST(req:Request){try{
  const user=await owner(),multipart=req.headers.get('content-type')?.includes('multipart/form-data');
  if(Number(req.headers.get('content-length')||0)>MAX_CATEGORY_IMAGE_BYTES*2+30000)throw Error('이미지 크기를 줄여 다시 선택해주세요.');
  const form=multipart?await req.formData():null;
  if(form&&Array.from(form.keys()).some(key=>key.startsWith('image')&&!['image1','image2'].includes(key)))throw Error('참고 이미지는 2장까지 등록할 수 있습니다.');
  const parsed=CategorySchema.safeParse(form?JSON.parse(String(form.get('category')||'{}')):await req.json());
  if(!parsed.success)throw Error('카테고리 이름·기간·일지 항목 수를 확인해주세요.');
  const value=parsed.data,id=value.id||crypto.randomUUID();
  if(value.id&&!await db().prepare('SELECT id FROM journal_categories WHERE id=? AND owner=?').bind(id,user).first())return Response.json({error:'카테고리를 찾을 수 없습니다.'},{status:404});
  const category={...value,id,updated:new Date().toISOString()};
  const statements=[db().prepare('INSERT INTO journal_categories (id,owner,title,payload,updated) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,payload=excluded.payload,updated=excluded.updated WHERE journal_categories.owner=excluded.owner').bind(id,user,category.title,JSON.stringify(category),category.updated)];
  if(form)for(const slot of [1,2]){const file=form.get(`image${slot}`);if(file===null)continue;if(!(file instanceof File)||!file.size||file.size>MAX_CATEGORY_IMAGE_BYTES)throw Error('512KB 이하 JPG·PNG·WebP 이미지를 선택해주세요.');const caption=form.get(`caption${slot}`)||'';if(typeof caption!=='string'||caption.length>500)throw Error('이미지 설명은 500자 이내로 입력해주세요.');const bytes=await file.arrayBuffer(),mime=imageType(new Uint8Array(bytes));if(!mime||mime!==file.type)throw Error('JPG·PNG·WebP 이미지 파일만 등록할 수 있습니다.');statements.push(db().prepare('INSERT INTO category_images (category_id,slot,owner,mime,data,caption,updated) VALUES (?,?,?,?,?,?,?) ON CONFLICT(category_id,slot) DO UPDATE SET mime=excluded.mime,data=excluded.data,caption=excluded.caption,updated=excluded.updated WHERE category_images.owner=excluded.owner').bind(id,slot,user,mime,bytes,caption.trim(),category.updated));}
  await db().batch(statements);return Response.json(category,{headers:{'Cache-Control':'no-store'}});
}catch(e){return failure(e);}}
