import { AiRecommendationPage, type ProductId } from '@/FE(namjun)/LogExperience';
import { notFound } from 'next/navigation';
const ids=['stark','ella','pina'];
export default async function Page({params}:{params:Promise<{product:string}>}){const {product}=await params;if(!ids.includes(product))notFound();return <AiRecommendationPage productId={product as ProductId}/>}
