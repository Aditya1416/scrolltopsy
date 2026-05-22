const KEY = 'c49d28da4693489c801a8dbb2d1b08f4';
const HOST = 'scrolltopsy.vercel.app';
const URLS = [
  'https://scrolltopsy.vercel.app/',
  'https://scrolltopsy.vercel.app/privacy',
];

async function submit() {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: URLS,
    }),
  });
  console.log('IndexNow response:', res.status, await res.text());
}

submit();
