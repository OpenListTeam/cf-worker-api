// biome-ignore lint/suspicious/noExplicitAny: can be any type for dynamic imports
const lazy = (importFunc: () => Promise<any>) => {
  return () => {
    return importFunc().then((module) => module.default || module);
  };
};

// { `driver_id`: module }
// will be mounted at `/api/:driver_id`
const routes: Record<string, ReturnType<typeof lazy>> = {
  aliyun: lazy(() => import("@/drivers/aliyun")),
  onedrive: lazy(() => import("@drivers/onedrive")),
};

export default routes;
