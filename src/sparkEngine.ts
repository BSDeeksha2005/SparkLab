export type Kind='map'|'filter'|'flatMap'|'distinct'|'sortBy'|'union'|'reduceByKey';
export type Config={kind:Kind; mode:string; value:string; extra:string};
export const parse=(s:string)=>s.split(/[\n,]+/).map(x=>x.trim()).filter(Boolean);
export function transform(xs:string[],c:Config):string[]{
 const n=c.value.trim()?Number(c.value):NaN;
 switch(c.kind){
 case'map': if(c.mode==='uppercase')return xs.map(x=>x.toUpperCase());if(c.mode==='lowercase')return xs.map(x=>x.toLowerCase());if(xs.some(x=>!Number.isFinite(Number(x))))throw Error('Numeric map needs number data. Choose a text case operation.');if(!Number.isFinite(n))throw Error('Enter a valid number.');return xs.map(x=>String(c.mode==='multiply'?Number(x)*n:Number(x)+n));
 case'filter':if(c.mode==='contains')return xs.filter(x=>x.toLowerCase().includes(c.value.toLowerCase()));if(xs.some(x=>!Number.isFinite(Number(x))))throw Error('Numeric filter needs numbers. Choose contains for text.');if(!Number.isFinite(n))throw Error('Enter a valid comparison value.');return xs.filter(x=>c.mode==='greater'?Number(x)>n:c.mode==='less'?Number(x)<n:Number(x)===n);
 case'flatMap':return xs.flatMap(x=>x.split(/[\s:]+/).filter(Boolean));
 case'distinct':return [...new Set(xs)];
 case'sortBy':return [...xs].sort((a,b)=>(Number.isFinite(Number(a))&&Number.isFinite(Number(b))?Number(a)-Number(b):a.localeCompare(b))*(c.mode==='descending'?-1:1));
 case'union':return [...xs,...parse(c.extra)];
 case'reduceByKey':{const m=new Map<string,number>();for(const row of xs){const i=row.lastIndexOf(':');const v=row.slice(i+1).trim();if(i<1||!v||!Number.isFinite(Number(v)))throw Error('Expected key:number records, for example tea:12.');const k=row.slice(0,i).trim();m.set(k,(m.get(k)||0)+Number(v));}return [...m].map(([k,v])=>`${k}:${v}`);}
 }
}
export function pipeline(xs:string[],ops:Config[]){const stages:{config:Config;input:string[];output:string[]}[]=[];let data=xs;for(const config of ops){const output=transform(data,config);stages.push({config,input:data,output});data=output;}return{stages,output:data};}
export function action(xs:string[],a:string,n=3,reduce='sum'){if(a==='collect')return JSON.stringify(xs);if(a==='count')return String(xs.length);if(a==='first')return xs[0]??'RDD is empty; first() has no element.';if(a==='take')return JSON.stringify(xs.slice(0,Math.max(0,n)));if(a==='reduce'){if(!xs.length||xs.some(x=>!Number.isFinite(Number(x))))return'reduce() needs a non-empty numeric RDD.';return String(reduce==='maximum'?Math.max(...xs.map(Number)):xs.reduce((s,x)=>s+Number(x),0));}return'';}
