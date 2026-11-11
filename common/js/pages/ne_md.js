/* Markdown-it 14.1.0 is bundled locally; raw HTML and automatic image requests are disabled. */
(() => {
  const md=window.markdownit({html:false,linkify:true,typographer:false});
  const safe=url=>{try{const value=String(url).trim();return !/[\u0000-\u0020\\]/.test(value)&&!value.startsWith('//')&&(!/^[a-z][a-z\d+.-]*:/i.test(value)||/^https?:/i.test(value));}catch{return false;}};
  md.validateLink=safe;
  md.renderer.rules.link_open=(tokens,index,options,env,self)=>{const token=tokens[index],url=token.attrGet('href');if(!safe(url)){token.attrSet('href','#');}else if(/^https?:/i.test(url)){token.attrSet('target','_blank');token.attrSet('rel','noopener noreferrer');}return self.renderToken(tokens,index,options);};
  md.renderer.rules.image=(tokens,index)=>{const t=tokens[index],url=t.attrGet('src'),label=md.utils.escapeHtml(t.content||'이미지 링크');return safe(url)?`<a href="${md.utils.escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`:label;};
  const defaultHeading=md.renderer.rules.heading_open||((tokens,i,options,env,self)=>self.renderToken(tokens,i,options));
  md.renderer.rules.heading_open=(tokens,index,options,env,self)=>{const token=tokens[index],title=tokens[index+1]?.children?.map(t=>t.content).join('')||tokens[index+1]?.content||'';const id=`section-${env.toc.length+1}`;token.attrSet('id',id);env.toc.push({id,title,level:Number(token.tag.slice(1))});return defaultHeading(tokens,index,options,env,self);};
  md.renderer.rules.table_open=()=>'<div class="report-table-scroll" tabindex="0" role="region" aria-label="가로로 스크롤할 수 있는 표"><table>';
  md.renderer.rules.table_close=()=>'</table></div>';
  window.onuriMarkdown={render(text){const env={toc:[]};return {html:md.render(text,env),toc:env.toc};},safe};
})();
