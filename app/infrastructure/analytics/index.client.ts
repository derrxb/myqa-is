import posthog from 'posthog-js';

if (process.env.NODE_ENV === 'production') {
  posthog.init(process.env.POSTHOG_URL!, {
    api_host: 'https://app.posthog.com',
  });
}

export { posthog };
