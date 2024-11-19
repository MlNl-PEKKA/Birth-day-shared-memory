"use client";

import { trpc } from "../_providers/trpc-provider";

const Page = () => {
  const { data } = trpc.example.useQuery();
  return <>{data}</>;
};

export default Page;
