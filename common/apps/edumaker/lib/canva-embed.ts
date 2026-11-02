/** Keep the optional share token, discard editing/tracking parameters. */
export function canvaEmbedUrl(value:string):string|null{
  try{
    const url=new URL(value);
    if(url.protocol!=='https:'||url.username||url.password||!['canva.com','www.canva.com'].includes(url.hostname))return null;
    const match=url.pathname.match(/^\/design\/([A-Za-z0-9_-]+)(?:\/([A-Za-z0-9_-]+))?(?:\/(?:view|edit|watch|present))?\/?$/);
    if(!match)return null;
    const token=match[2]&&!['view','edit','watch','present'].includes(match[2])?'/'+match[2]:'';
    return `https://www.canva.com/design/${match[1]}${token}/view?embed`;
  }catch{return null;}
}
