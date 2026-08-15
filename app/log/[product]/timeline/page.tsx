import { TimelinePage, type ProductId } from '@/FE(namjun)/LogExperience';
import { notFound } from 'next/navigation';
const ids=['stark','ella','pina'];
export function generateStaticParams(){ return ids.map(product=>({product})); }
export default async function Page({params}:{params:Promise<{product:string}>}){const {product}=await params;if(!ids.includes(product))notFound();return <TimelinePage productId={product as ProductId}/>}
