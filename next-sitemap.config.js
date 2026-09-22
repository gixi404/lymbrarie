/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://lymbrarie.vercel.app",
  generateRobotsTxt: true,
  exclude: [
    "/error",
    "/book/**",
    "/login",
    "/faq",
    "/privacypolicy",
    "/termsofuse",
    "/guest",
    "/404",
    "/guest",
    "/guest/**",
    "/recommendation/**",
    "/config",
    "/donations",
    "/profile",
    "/reader/**",
  ],
  robotsTxtOptions: {
    additionalSitemaps: [
      "https://lymbrarie.vercel.app/sitemap.xml",
      "https://lymbrarie.vercel.app/sitemap-0.xml",
    ],
  },
};
