import { RecordDetailPage, type ProductId } from '@/FE(namjun)/LogExperience';
import { notFound } from 'next/navigation';

const ids=['stark','ella','pina'];
export default async function Page({params}:{params:Promise<{product:string;record:string}>}){
  const {product,record}=await params;
  if(!ids.includes(product)||!record.trim())notFound();
  return <RecordDetailPage productId={product as ProductId} recordId={record}/>;
}
