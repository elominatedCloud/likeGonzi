import { RecordWritePage, type ProductId } from '@/FE(namjun)/LogExperience';
import { notFound } from 'next/navigation';
const ids=['stark','ella','pina'];
export default async function Page({params,searchParams}:{params:Promise<{product:string}>;searchParams:Promise<{aiImage?:string}>}){const [{product},{aiImage}]=await Promise.all([params,searchParams]);if(!ids.includes(product))notFound();return <RecordWritePage productId={product as ProductId} initialAiImage={aiImage}/>}
