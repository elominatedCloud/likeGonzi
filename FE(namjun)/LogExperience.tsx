'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styles from './log-experience.module.css';
import { BottomNav } from '@/Components/ui/BottomNav';
import { AmbientPattern } from '@/Components/ui/AmbientPattern';
import {
  createStory as createStoryRequest,
  deleteStory as deleteStoryRequest,
  getStory as getStoryRequest,
  listStories as listStoriesRequest,
} from '@/lib/story-api-client';
import { COMPANIONS, OCCASIONS, type CompanionId, type OccasionId } from '@/types/story-api';
import { normalizePlace } from '@/lib/place-normalize';
import { apiFetch } from '@/lib/api-client';
import type { TimelineEntry } from '@/app/api/timeline/route';
import { persistCloudStory, persistStoryPhoto, removeStoryPhoto } from '@/lib/story-photo-storage';
import type { StoryRecord } from '@/types/story-api';
import { getProductDetailPath } from '@/lib/product-routes';

const A = '/FE-namjun/assets';
export type ProductId = 'stark' | 'ella' | 'pina';
type Entry = { id?:string; kind:'product'|'care'|'memory'; date:string; title:string; sub:string; note?:string; image?:string; place?:string; story?:string };
type Product = { id:ProductId; name:string; short:string; material:string; image:string; bought:string; condition:string; latest:string; place:string; memoryTitle:string; memoryCopy:string; aiReason:string; timelineImage:string; aiImages:string[]; entries:Entry[] };
type CareRecord = { id:string; productId:ProductId; date:string; title:string; sub:string; note:string; image:string; photos:string[] };
const DELETED_RECORDS_KEY='likegonzi-deleted-records';
const CARE_RECORDS_KEY='likegonzi-care-records';
const STORY_DRAFT_KEY='likegonzi-story-draft';
const AI_IMAGE_KEY='likegonzi-ai-selected-image';

export const products:Record<ProductId,Product> = {
  stark:{id:'stark',name:'Stark Side Studs Backpack in Visetos',short:'Stark Backpack',material:'Cognac Visetos',image:`${A}/로그_스토리북-2.png`,bought:'2024.05.12',condition:'양호',latest:'2025.11.04',place:'서울 성수동',memoryTitle:'성수에서 만난 새로운 영감',memoryCopy:'전시를 보고 카페에 들른 여유로운 토요일.',aiReason:'전시를 즐긴 여유로운 토요일과 Cognac 컬러의 따뜻한 분위기를 반영했어요.',timelineImage:`${A}/로그_타임라인-2.png`,aiImages:[`${A}/AI-추천-이미지-1.png`,`${A}/AI-추천-이미지-2.png`,`${A}/AI-추천-이미지-3.png`],entries:[
    {id:'purchase-registration',kind:'product',date:'2024.05.12',title:'구매 · 정품 등록',sub:'Stark Visetos Backpack',place:'MCM 공식 온라인 스토어',story:'정품 인증을 완료하며 Stark Visetos Backpack의 첫 제품 이력이 생성되었습니다.',note:'정품 인증과 함께 첫 로그가 생성되었습니다.',image:`${A}/로그_타임라인-1.png`},
    {kind:'care',date:'2024.09.06',title:'장마철 케어 완료',sub:'가죽 클리닝 및 컨디셔닝 완료'},
    {id:'seongsu-inspiration',kind:'memory',date:'2025.05.09',title:'성수에서 만난 새로운 영감',sub:'서울 성수동 · Stark Backpack',place:'서울 성수동',story:'오래 함께한 가방 덕분에 익숙한 하루도 조금 더 특별한 장면으로 남았다.',note:'전시를 보고 카페에 들른 여유로운 날.\n#성수 #전시 #Backpack',image:`${A}/로그_타임라인-2.png`},
    {id:'paris-trip',kind:'memory',date:'2025.08.16',title:'파리 여행',sub:'프랑스 파리 · Stark Backpack',place:'프랑스 파리',story:'낯선 거리에서 함께한 가방은 여행의 순간마다 익숙한 리듬을 만들어 주었다.',note:'첫 여름 휴가, 가방과 함께한 파리.\n#여름휴가 #파리',image:`${A}/로그_타임라인-3.png`},
    {kind:'care',date:'2025.09.03',title:'장마철 케어 완료',sub:'가죽 클리닝 및 컨디셔닝 완료'}]},
  ella:{id:'ella',name:'Ella Boston Bag in Visetos',short:'Ella Boston Bag',material:'Black Visetos',image:`${A}/로그_스토리북-3.png`,bought:'2025.11.03',condition:'주의',latest:'2026.04.21',place:'서울 한남동',memoryTitle:'재즈 선율과 함께한 저녁',memoryCopy:'작은 공연장에서 좋아하는 연주를 들으며 보낸 특별한 밤.',aiReason:'검정 Visetos와 공연장의 골드 조명이 어우러진 우아한 저녁 분위기를 반영했어요.',timelineImage:`${A}/ella-jazz-memory.png`,aiImages:[`${A}/ella-ai-concert.png`,`${A}/ella-jazz-memory.png`],entries:[
    {kind:'product',date:'2025.11.03',title:'구매 · 정품 등록',sub:'Ella Boston Bag · Black Visetos',note:'한남 플래그십에서 첫 로그를 시작했어요.',image:`${A}/로그_스토리북-3.png`},
    {id:'jazz-evening',kind:'memory',date:'2026.01.17',title:'재즈 선율과 함께한 저녁',sub:'서울 한남동 · Ella Boston Bag',place:'서울 한남동',story:'잔잔한 선율과 검정 가방의 빛이 저녁의 기억을 오래 붙잡아 주었다.',note:'작은 공연장에서 만난 깊은 선율.\n#재즈 #한남 #Evening',image:`${A}/ella-jazz-memory.png`},
    {kind:'care',date:'2026.02.08',title:'금속 장식 케어 완료',sub:'금장 잠금장치 폴리싱 및 가죽 보습'},
    {id:'spring-gallery',kind:'memory',date:'2026.04.21',title:'봄날의 갤러리 오프닝',sub:'서울 청담동 · Ella Boston Bag',place:'서울 청담동',story:'새 작품을 처음 마주한 설렘과 검정 보스턴백의 단정한 실루엣이 봄 저녁을 완성했다.',note:'검정 가방이 크림 수트의 포인트가 된 날.\n#Gallery #Spring',image:`${A}/ella-ai-concert.png`}]},
  pina:{id:'pina',name:'Pina Studded Wallet in Calfskin',short:'Pina Studded Wallet',material:'Black Calfskin',image:`${A}/로그_스토리북-4.png`,bought:'2025.01.18',condition:'양호',latest:'2026.08.04',place:'서울 서촌',memoryTitle:'책갈피 사이에 남은 오후',memoryCopy:'독립서점에서 고른 책과 커피 한 잔으로 천천히 보낸 가을 오후.',aiReason:'검정 Calfskin 지갑과 오래된 책, 가을 햇살의 차분한 질감을 반영했어요.',timelineImage:`${A}/pina-bookstore-memory.png`,aiImages:[`${A}/pina-ai-museum.png`,`${A}/pina-bookstore-memory.png`],entries:[
    {kind:'product',date:'2025.01.18',title:'구매 · 정품 등록',sub:'Pina Wallet · Black Calfskin',note:'작은 지갑의 첫 기록이 생성되었습니다.',image:`${A}/로그_스토리북-4.png`},
    {id:'bookstore-afternoon',kind:'memory',date:'2025.10.12',title:'책갈피 사이에 남은 오후',sub:'서울 서촌 · Pina Wallet',place:'서울 서촌',story:'책장을 넘기던 손끝과 작은 지갑이 고요한 오후의 온도를 기억한다.',note:'독립서점에서 발견한 한 권의 책.\n#서촌 #북카페 #Wallet',image:`${A}/pina-bookstore-memory.png`},
    {kind:'care',date:'2026.03.14',title:'가죽 표면 케어 완료',sub:'Calfskin 클리닝 및 모서리 보호'},
    {id:'museum-postcard',kind:'memory',date:'2026.08.04',title:'미술관에서 쓴 엽서',sub:'서울 덕수궁길 · Pina Wallet',place:'서울 덕수궁길',story:'전시의 여운을 엽서에 적는 동안 작은 지갑은 조용히 그날의 시간을 지켜보았다.',note:'전시의 여운을 짧은 문장으로 남긴 날.\n#미술관 #엽서',image:`${A}/pina-ai-museum.png`}]}
};
const ALL_PRODUCT_IDS=Object.keys(products) as ProductId[];

function StatusBar(){return <div className={styles.status}><span>9:41</span><span className={styles.signals}>● ᯤ ▰</span></div>}
function Pattern(){return <div className={styles.pattern} aria-hidden="true"/>}
function Header({title,back=false,action}:{title:string;back?:boolean;action?:React.ReactNode}){const router=useRouter();return <header className={styles.header}><span>{back&&<button className={styles.back} onClick={()=>router.back()} aria-label="뒤로 가기">←</button>}</span><h1>{title}</h1><span className={styles.headerAction}>{action}</span></header>}
function Shell({children,height='auto'}:{children:React.ReactNode;height?:number|'auto'}){return <main className={styles.stage}><section className={styles.phone} style={{minHeight:height==='auto'?undefined:height}}><Pattern/><AmbientPattern variant="log"/><StatusBar/>{children}<BottomNav/></section></main>}

export function StorybookPage(){return <Shell><Header title="스토리북"/><div className={styles.storyContent}><p className={styles.eyebrow}>MY STORYBOOK</p><p className={styles.conditionNote}>제품 상태는 최근 등록된 관리·수선 기록을 기준으로 한 데모 표기입니다.</p>{Object.values(products).map(p=>{const memoryCount=p.entries.filter(e=>e.kind==='memory').length;return <article className={styles.storyCard} key={p.id}><img loading="lazy" src={p.image} alt={p.name} className={styles.productImage}/><div className={styles.productInfo}><h2>{p.name}</h2><dl><div><dt>구매</dt><dd>{p.bought}</dd></div><div><dt>상태</dt><dd>{p.condition}<small className={styles.demoLabel}>데모 기준</small></dd></div><div><dt>추억</dt><dd>{memoryCount} 개</dd></div><div><dt>최근 기록</dt><dd>{p.latest}</dd></div></dl></div><Link className={styles.storyLink} href={memoryCount?`/log/${p.id}/timeline`:`/log/${p.id}/record/new`}>{memoryCount?'Storybook 보기 →':'첫 기록 작성하기 →'}</Link></article>})}</div></Shell>}

type Tab='all'|'mine'|'product';
type UnifiedTimelineEntry=Entry&{productIds:ProductId[]};
// localStorage hydration intentionally updates the client shell after mount.
/* eslint-disable react-hooks/set-state-in-effect */
export function AllTimelinePage(){
  const [tab,setTab]=useState<Tab>('all');
  const [timeline,setTimeline]=useState<TimelineEntry[]>([]);

  // 등록·기록·수선을 서버에서 한 줄기로 받아온다.
  // 예전에는 제품 이력이 하드코딩, 케어 기록이 localStorage라 수선을 접수해도
  // 여기 안 나타나고 기기를 바꾸면 사라졌다.
  useEffect(()=>{
    let active=true;
    apiFetch<TimelineEntry[]>('/api/timeline').then(result=>{
      if(!active||!result.ok)return;
      setTimeline(result.data);
    }).catch(()=>{});
    return()=>{active=false};
  },[]);

  const shown:UnifiedTimelineEntry[]=timeline
    .filter(entry=>tab==='all'||(tab==='mine'?entry.kind==='story':entry.kind!=='story'))
    .map(entry=>({
      id:entry.id,
      kind:entry.kind==='story'?'memory':entry.kind==='repair'?'care':'product',
      date:entry.date.replaceAll('-','.'),
      title:entry.title,
      place:entry.place??undefined,
      sub:`${entry.place||'장소 미지정'} · ${entry.product_name}`,
      note:entry.note??undefined,
      image:entry.image??undefined,
      productIds:[entry.product_slug as ProductId],
    }));

  const entryHref=(entry:UnifiedTimelineEntry)=>{
    const productId=entry.productIds[0];
    if(entry.kind==='care')return getProductDetailPath(productId)?`${getProductDetailPath(productId)}/care`:`/log/${productId}/timeline`;
    if(entry.id)return `/log/${productId}/record/${entry.id}`;
    return getProductDetailPath(productId)??`/log/${productId}/timeline`;
  };

  return <Shell height={976}>
    <div className={styles.timelineHead}>
      <h1 className={styles.allTimelineTitle}>전체 타임라인</h1>
      <Link href="/log/stark/record/new" className={styles.addRecord}>+ 기록 추가</Link>
    </div>
    <div className={styles.tabs} role="tablist" aria-label="타임라인 기록 유형">
      <button type="button" role="tab" aria-selected={tab==='all'} className={tab==='all'?styles.on:''} onClick={()=>setTab('all')}>전체</button>
      <button type="button" role="tab" aria-selected={tab==='mine'} className={tab==='mine'?styles.on:''} onClick={()=>setTab('mine')}>내 기록</button>
      <button type="button" role="tab" aria-selected={tab==='product'} className={tab==='product'?styles.on:''} onClick={()=>setTab('product')}>제품 이력</button>
    </div>
    <div className={styles.timeline}>
      <div className={styles.timelineSummary}>
        <p className={styles.eyebrow}>ALL PRODUCTS</p>
        <span>{shown.length}개의 기록</span>
      </div>
      {shown.map((entry,index)=><Link href={entryHref(entry)} className={styles.timelineCard} key={`${entry.productIds.join('-')}-${entry.date}-${entry.id??index}`}>
        <div className={styles.timelineText}>
          <div className={styles.productBadges}>{entry.productIds.map(productId=><span key={productId}>{products[productId].short}</span>)}</div>
          <small>{entry.date} · {entry.kind==='memory'?'내 기록':'제품 이력'}</small>
          <h2>{entry.title}</h2>
          <p>{entry.sub}</p>
          {entry.note&&<p className={styles.note}>{entry.note}</p>}
        </div>
        {entry.image?<img loading="lazy" src={entry.image} alt=""/>:<span className={styles.shield}>✓</span>}
      </Link>)}
    </div>
  </Shell>;
}

export function TimelinePage({productId,tab='all'}:{productId:ProductId;tab?:Tab}){
  const p=products[productId];
  const [timeline,setTimeline]=useState<TimelineEntry[]>([]);

  // 전체 타임라인과 같은 소스를 쓴다(등록·기록·수선 모두 DB).
  // 예전에는 제품 이력이 하드코딩, 케어 기록이 localStorage라 수선이 안 보였다.
  useEffect(()=>{
    let active=true;
    apiFetch<TimelineEntry[]>(`/api/timeline?product=${encodeURIComponent(productId)}`)
      .then(result=>{
        if(active&&result.ok)setTimeline(result.data);
      }).catch(()=>{});
    return()=>{active=false};
  },[productId]);

  const shown:Entry[]=timeline
    .filter(entry=>tab==='all'||(tab==='mine'?entry.kind==='story':entry.kind!=='story'))
    .map(entry=>({
      id:entry.id,
      kind:(entry.kind==='story'?'memory':entry.kind==='repair'?'care':'product') as Entry['kind'],
      date:entry.date.replaceAll('-','.'),
      title:entry.title,
      place:entry.place??undefined,
      sub:`${entry.place||'장소 미지정'} · ${entry.product_name}`,
      note:entry.note??undefined,
      image:entry.image??undefined,
    }))
    .sort((a,b)=>a.date.localeCompare(b.date));
  return <Shell height={976}><div className={styles.timelineHead}><StatusTitle title={p.short}/><Link href={`/log/${p.id}/record/new`} className={styles.addRecord}>+ 기록 추가</Link></div><div className={styles.tabs}><Link className={tab==='all'?styles.on:''} href={`/log/${p.id}/timeline`}>전체</Link><Link className={tab==='mine'?styles.on:''} href={`/log/${p.id}/timeline/my`}>내 기록</Link><Link className={tab==='product'?styles.on:''} href={`/log/${p.id}/timeline/product`}>제품 이력</Link></div><div className={`${styles.timeline} ${tab!=='all'?styles.compactTimeline:''}`}><p className={styles.eyebrow}>MY MEMORY</p>{shown.map((e,i)=><Link href={e.id?`/log/${p.id}/record/${e.id}`:'#'} className={styles.timelineCard} key={`${e.date}-${e.id??i}`}><div className={styles.timelineText}><small>{e.date} · {e.kind==='memory'?'내 기록':'제품 이력'}</small><h2>{e.title}</h2><p>{e.sub}</p>{e.note&&<p className={styles.note}>{e.note}</p>}</div>{e.image?<img loading="lazy" src={e.image} alt=""/>:<span className={styles.shield}>✓</span>}</Link>)}</div></Shell>
}
function StatusTitle({title}:{title:string}){const router=useRouter();return <><button className={styles.back} onClick={()=>router.back()}>←</button><h1 className={styles.productTitle}>{title}</h1></>}

export function RecordDetailPage({productId,recordId}:{productId:ProductId;recordId:string}){
  const p=products[productId],router=useRouter();
  const initial=p.entries.find(e=>e.id===recordId)??null;
  const [memory,setMemory]=useState<Entry|null>(initial);
  const [withProducts,setWithProducts]=useState<ProductId[]>([productId]);

  useEffect(()=>{
    if(initial)return;
    let active=true;
    getStoryRequest(productId,recordId).then(result=>{
      if(!active||!result.ok)return;
      const found=result.data;
      setMemory({
        id:found.id,
        kind:'memory',
        date:found.created_at.slice(0,10).replaceAll('-','.'),
        title:found.tag,
        place:found.place,
        sub:found.place,
        note:found.memo,
        image:found.image_url,
        story:found.story,
      });
      setWithProducts((found.product_ids?.filter(id=>id in products) as ProductId[])??[productId]);
    });
    return()=>{active=false};
  },[initial,productId,recordId]);

  if(!memory){
    return <Shell height={976}><Header title="내 기록" back/><div className={styles.detailLoading}>기록을 불러오고 있어요.</div></Shell>;
  }

  const removeRecord=async()=>{
    if(!window.confirm(`“${memory.title}” 기록을 삭제할까요? 삭제한 기록은 복구할 수 없습니다.`))return;
    if(memory.kind==='memory'){
      await deleteStoryRequest(productId,recordId);
    }else{
      let deleted:string[]=[];
      try{deleted=JSON.parse(localStorage.getItem(DELETED_RECORDS_KEY)??'[]')}catch{}
      const key=`${productId}:${recordId}`;
      if(!deleted.includes(key))localStorage.setItem(DELETED_RECORDS_KEY,JSON.stringify([...deleted,key]));
    }
    router.replace(`/log/${productId}/timeline`);
  };

  const isMemory=memory.kind==='memory';
  return <Shell height={976}>
    <Header title={isMemory?'내 기록':'제품 이력'} back/>
    <div className={styles.detailContent}>
      <div className={styles.hero}>
        <img loading="lazy" src={memory.image??p.timelineImage} alt={`${memory.title} 기록`}/>
        <div><small>{memory.date} · {memory.place??p.place}</small><h2>{memory.title}</h2></div>
      </div>
      <p className={styles.eyebrow}>{isMemory?'MY MEMORY':'PRODUCT HISTORY'}</p>
      <p className={styles.memoryText}>{memory.note?.split('\n')[0]??p.memoryCopy}</p>
      <p className={styles.eyebrow}>WITH</p>
      {withProducts.map(id=>{
        const item=products[id],detailPath=getProductDetailPath(id);
        const content=<><img loading="lazy" src={item.image} alt=""/><span><b>{item.short}</b><small>{item.material}</small></span><strong>›</strong></>;
        return detailPath?<Link className={styles.withCard} href={detailPath} key={id}>{content}</Link>:<button className={styles.withCard} key={id} disabled>{content}</button>;
      })}
      <p className={styles.eyebrow}>{isMemory?'STORY NOTE':'DETAIL'}</p>
      <div className={styles.aiStory}>{memory.story??memory.note}</div>
      {isMemory&&<>
        <button className={`${styles.primary} ${styles.comingSoon}`} type="button" disabled>인스타 스토리 만들기 · 준비 중</button>
        <section className={styles.deleteBanner} aria-label="기록 삭제">
          <div><b>이 기록을 삭제할까요?</b><small>삭제하면 타임라인에서도 사라지며 복구할 수 없습니다.</small></div>
          <button type="button" onClick={removeRecord}>기록 삭제</button>
        </section>
      </>}
    </div>
  </Shell>;
}

export function RecordWritePage({productId,initialAiImage}:{productId:ProductId;initialAiImage?:string}){
  const p=products[productId],router=useRouter(),input=useRef<HTMLInputElement>(null);
  const [selectedIds,setSelectedIds]=useState<ProductId[]>([productId]);
  const [pickerOpen,setPickerOpen]=useState(false);
  const [photo,setPhoto]=useState(p.timelineImage);
  const [memo,setMemo]=useState(p.memoryCopy);
  // 상황·동행은 자유 텍스트가 아니라 정해진 값에서 고른다(집계 가능해야 해서).
  const [occasion,setOccasion]=useState<OccasionId[]>([]);
  const [companion,setCompanion]=useState<CompanionId|null>(null);
  const [saving,setSaving]=useState(false);
  const [saveError,setSaveError]=useState('');

  useEffect(()=>{
    try{
      const savedDraft=sessionStorage.getItem(STORY_DRAFT_KEY);
      if(savedDraft){
        const draft=JSON.parse(savedDraft) as {photo?:string;memo?:string;selectedIds?:ProductId[]};
        if(draft.photo)setPhoto(draft.photo);
        if(typeof draft.memo==='string')setMemo(draft.memo);
        if(draft.selectedIds?.length)setSelectedIds(draft.selectedIds.filter(id=>id in products));
      }
      const selectedImage=initialAiImage||sessionStorage.getItem(AI_IMAGE_KEY);
      if(selectedImage){
        setPhoto(selectedImage);
        sessionStorage.removeItem(AI_IMAGE_KEY);
      }
      const cameraDraft=sessionStorage.getItem('likegonzi-camera-draft');
      if(cameraDraft){
        setPhoto(cameraDraft);
        sessionStorage.removeItem('likegonzi-camera-draft');
      }
    }catch{}
  },[initialAiImage]);

  const toggle=(id:ProductId)=>{
    if(id===productId)return;
    setSelectedIds(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);
  };
  const toggleOccasion=(id:OccasionId)=>{
    setOccasion(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);
  };
  const load=(e:ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];
    if(!f)return;
    const reader=new FileReader();
    reader.onload=()=>setPhoto(String(reader.result));
    reader.readAsDataURL(f);
  };
  const maps=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.place)}`;

  const save=async()=>{
    if(saving)return;
    setSaving(true);
    setSaveError('');

    try{
      const now=new Date();
      const title=selectedIds.length>1
        ?`${selectedIds.map(id=>products[id].short).join('와 ')}의 하루`
        :`${p.short}와 함께한 새로운 기록`;
      const story=`${selectedIds.map(id=>products[id].short).join(', ')}와 함께한 순간이 하나의 소중한 기록으로 남았다.`;
      // 장소 원문은 그대로 두고 집계용 city/country를 함께 채운다.
      const place=normalizePlace(p.place);
      const persisted=await persistStoryPhoto(photo,productId);
      let createdId='';
      if(persisted.mode==='cloud'){
        try{
          const created=await persistCloudStory({
            tag:title,
            photoPath:persisted.photoPath,
            location:p.place,
            memo,
            storyDate:now.toISOString().slice(0,10),
            productSlugs:selectedIds,
            occasion,
            companion,
            city:place.city,
            country:place.country,
          });
          createdId=created.id;
        }catch(error){
          await removeStoryPhoto(persisted.photoPath);
          throw error;
        }
      }else{
        const response=await createStoryRequest(productId,{
          image_url:photo,
          tag:title,
          place:p.place,
          memo,
          story,
          product_ids:selectedIds,
          occasion,
          companion:companion??undefined,
          city:place.city??undefined,
          country:place.country??undefined,
          date:now.toISOString(),
        });
        if(!response.ok)throw new Error(response.error.message);
        createdId=response.data.id;
      }
      sessionStorage.removeItem(STORY_DRAFT_KEY);
      sessionStorage.removeItem(AI_IMAGE_KEY);
      router.push(`/log/${productId}/record/${createdId}`);
    }catch(error){
      setSaveError(error instanceof Error?error.message:'기록 저장에 실패했습니다. 다시 시도해 주세요.');
    }finally{
      setSaving(false);
    }
  };

  return <Shell height={852}>
    <Header title="새 기록" back action={<button className={styles.save} onClick={save} disabled={saving}>{saving?'저장 중…':'저장'}</button>}/>
    <div className={styles.form}>
      {saveError&&<p className={styles.saveError} role="alert">{saveError}</p>}
      <label>PHOTO</label>
      <button className={styles.photo} onClick={()=>input.current?.click()}><img loading="lazy" src={photo} alt="선택한 기록 사진"/><span>＋ 사진 추가 · 변경</span></button>
      <input ref={input} hidden type="file" accept="image/*" onChange={load}/>
      <label>PRODUCT <small>한 사진에 함께 나온 상품을 추가하세요.</small></label>
      <div className={styles.selectedChips}>{selectedIds.map(id=><span key={id}><img loading="lazy" src={products[id].image} alt=""/>{products[id].short}</span>)}</div>
      <div className={styles.productPick}><button className={styles.selectedProduct} onClick={()=>setPickerOpen(v=>!v)}><span>{selectedIds.length}개 상품 선택됨</span><b>{pickerOpen?'⌃':'⌄'}</b></button></div>
      {pickerOpen&&<div className={styles.productList} role="listbox" aria-label="보유 상품 복수 선택">{Object.values(products).map(item=>{const selected=selectedIds.includes(item.id);return <button key={item.id} onClick={()=>toggle(item.id)} className={selected?styles.productSelected:''} aria-pressed={selected}><img loading="lazy" src={item.image} alt=""/><span><b>{item.short}</b><small>{item.material}{item.id===productId?' · 현재 타임라인':''}</small></span><strong>{selected?'✓':'＋'}</strong></button>})}</div>}
      <label>PLACE</label>
      <div className={styles.field}>⌖　{p.place}<a href={maps} target="_blank" rel="noreferrer">장소 변경　›</a></div>
      <label>OCCASION <small>어떤 상황이었는지 골라주세요. 여러 개 선택할 수 있어요.</small></label>
      <div className={styles.chipRow} role="group" aria-label="상황 선택">
        {OCCASIONS.map(item=>{const on=occasion.includes(item.id);return <button key={item.id} type="button" aria-pressed={on} className={on?styles.chipOn:''} onClick={()=>toggleOccasion(item.id)}>{item.label}</button>})}
      </div>
      <label>COMPANION <small>누구와 함께였나요?</small></label>
      <div className={styles.chipRow} role="group" aria-label="동행 선택">
        {COMPANIONS.map(item=>{const on=companion===item.id;return <button key={item.id} type="button" aria-pressed={on} className={on?styles.chipOn:''} onClick={()=>setCompanion(on?null:item.id)}>{item.label}</button>})}
      </div>
      <label htmlFor="memo">MEMO</label>
      <div className={styles.memo}><textarea id="memo" maxLength={100} value={memo} onChange={e=>setMemo(e.target.value)}/><small>{memo.length} / 100</small></div>
      <label>AI IMAGE SUGGESTION <small>(MVP 제외)</small></label>
      <button className={`${styles.field} ${styles.disabledFeature}`} type="button" disabled>추천 이미지 기능은 다음 버전에서 제공됩니다. <small>준비 중</small></button>
    </div>
  </Shell>
}

export function AiRecommendationPage({productId}:{productId:ProductId}){
  const p=products[productId];
  return <Shell height={930}>
    <Header title="AI 추천 이미지" back/>
    <div className={styles.aiContent}>
      <div className={styles.featurePlaceholder}>
        <p className={styles.eyebrow}>NEXT VERSION</p>
        <h2>{p.short}의 기록을 위한<br/>AI 추천 이미지를 준비 중이에요.</h2>
        <p>이번 MVP에서는 사용자가 직접 촬영하거나 앨범에서 고른 실제 사진만 기록에 사용합니다.</p>
        <Link className={styles.primary} href={`/log/${productId}/record/new`}>직접 사진으로 기록하기</Link>
      </div>
    </div>
  </Shell>;
}

export function DemoIndex(){const base=[['로그_스토리북','/log/storybook']];const productLinks=Object.values(products).flatMap(p=>{const memories=p.entries.filter(e=>e.kind==='memory');return [[`${p.short} · 전체 타임라인`,`/log/${p.id}/timeline`],[`${p.short} · 내 기록`,`/log/${p.id}/timeline/my`],[`${p.short} · 제품 이력`,`/log/${p.id}/timeline/product`],...memories.map(e=>[`${p.short} · ${e.title}`,`/log/${p.id}/record/${e.id}`]),[`${p.short} · 복수 상품 기록 작성`,`/log/${p.id}/record/new`],[`${p.short} · AI 추천 이미지`,`/log/${p.id}/ai-recommendation`]]});const links=[...base,...productLinks];return <main className={styles.demo}><h1>FE(namjun) 데모</h1><p>Figma 393px 기준, 상품별 시나리오와 이미지를 분리한 인터랙티브 데모입니다.</p>{links.map(([n,h],i)=><Link href={h} key={h}><span>{i+1}</span>{n}<b>›</b></Link>)}</main>}
