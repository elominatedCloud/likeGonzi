import { redirect } from "next/navigation";
import { MCM_OFFICIAL_SHOP_URL } from "@/lib/navigation";

export default function ShopPage() {
  redirect(MCM_OFFICIAL_SHOP_URL);
}
