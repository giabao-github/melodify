import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { ProductWithPrice } from '../types';

const getActiveProducts = async (): Promise<ProductWithPrice[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

    if (error) {
      console.log("An error occurred: ", error);
    }

    return (data as any) || [];
};

export default getActiveProducts;