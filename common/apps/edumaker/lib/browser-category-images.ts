import {MAX_CATEGORY_IMAGE_BYTES} from './category-images';
export async function prepareReferenceImage(file:File){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024)throw Error('15MB 이하 JPG·PNG·WebP 이미지를 선택해주세요.');
  const bitmap=await createImageBitmap(file).catch(()=>{throw Error('이미지를 읽지 못했습니다. 다른 파일을 선택해주세요.');});
  try{const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');if(!ctx)throw Error('이미지를 처리하지 못했습니다.');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);for(const quality of [.9,.75,.55,.35]){const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('이미지 변환에 실패했습니다.')),'image/jpeg',quality));if(blob.size<=MAX_CATEGORY_IMAGE_BYTES)return new File([blob],'reference.jpg',{type:'image/jpeg'});}throw Error('이미지 크기를 줄여 다시 선택해주세요.');}finally{bitmap.close();}
}
