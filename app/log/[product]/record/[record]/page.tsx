import { RecordDetailPage, type ProductId } from '@/FE(namjun)/LogExperience';
import { notFound } from 'next/navigation';

const ids=['stark','ella','pina'];
const records:Record<string,string[]>= {
  stark:['seongsu-inspiration','paris-trip'],
  ella:['jazz-evening','spring-gallery'],
  pina:['bookstore-afternoon','museum-postcard'],
};

export default async function Page({params}:{params:Promise<{product:string;record:string}>}){
  const {product,record}=await params;
  if(!ids.includes(product)||(!records[product]?.includes(record)&&!record.startsWith('shared-')))notFound();
  return <RecordDetailPage productId={product as ProductId} recordId={record}/>;
}
