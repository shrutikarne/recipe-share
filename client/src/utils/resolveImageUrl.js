const getNormalizedApiBase = () => {
  const apiEnv = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  try {
    const parsed = new URL(apiEnv);
    let pathname = parsed.pathname.replace(/\/?$/, '');
    pathname = pathname.replace(/\/api$/, '');
    return `${parsed.origin}${pathname}`;
  } catch (error) {
    return apiEnv.replace(/\/api\/?$/, '');
  }
};

export const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url === '/hero-food.jpg') return url;

  const s3Match = url.match(/^https?:\/\/[^.]+\.s3[.-][^/]+\.amazonaws\.com\/(.+)$/i);
  if (s3Match && s3Match[1]) {
    const base = getNormalizedApiBase();
    const qs = new URLSearchParams({ key: s3Match[1] }).toString();
    return `${base}/api/images?${qs}`;
  }

  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  const base = getNormalizedApiBase();
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${base}${normalizedPath}`;
};

export default resolveImageUrl;
