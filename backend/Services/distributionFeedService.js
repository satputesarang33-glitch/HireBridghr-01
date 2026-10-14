/**
 * Job Distribution Feed & Syndication Service
 * Generates industry-standard XML/RSS feeds for Indeed, Google Jobs, and job board aggregators.
 */

export const distributionFeedService = {
  /**
   * Generates Indeed-compatible XML feed
   */
  generateIndeedXml(jobs = [], baseUrl = "http://localhost:3000") {
    const xmlJobs = jobs
      .filter((j) => j.status === "PUBLISHED")
      .map((j) => {
        const pubDate = new Date(j.publishedAt || j.createdAt || Date.now()).toUTCString();
        const cleanDesc = (j.description || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        return `
    <job>
      <title><![CDATA[${j.title || ""}]]></title>
      <date><![CDATA[${pubDate}]]></date>
      <referencenumber><![CDATA[${j.id}]]></referencenumber>
      <url><![CDATA[${baseUrl}/jobs/${j.slug || j.id}]]></url>
      <company><![CDATA[${j.client || "Apex Global Tech"}]]></company>
      <city><![CDATA[${j.location || "San Francisco"}]]></city>
      <state><![CDATA[CA]]></state>
      <country><![CDATA[US]]></country>
      <description><![CDATA[${cleanDesc}]]></description>
      <salary><![CDATA[$${j.salaryMin || 100000} - $${j.salaryMax || 150000}]]></salary>
      <jobtype><![CDATA[${j.employmentType || "fulltime"}]]></jobtype>
    </job>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="utf-8"?>
<source>
  <publisher>HireBridgeHR</publisher>
  <publisherurl>${baseUrl}</publisherurl>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${xmlJobs}
</source>`;
  },

  /**
   * Generates Standard RSS 2.0 Job Feed
   */
  generateRssFeed(jobs = [], baseUrl = "http://localhost:3000") {
    const items = jobs
      .filter((j) => j.status === "PUBLISHED")
      .map((j) => {
        return `
    <item>
      <title><![CDATA[${j.title} at ${j.client || "Apex Global Tech"}]]></title>
      <link>${baseUrl}/jobs/${j.slug || j.id}</link>
      <guid>${j.id}</guid>
      <pubDate>${new Date(j.publishedAt || j.createdAt || Date.now()).toUTCString()}</pubDate>
      <description><![CDATA[${j.description || ""}]]></description>
      <category><![CDATA[${j.department || "Technology"}]]></category>
    </item>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>HireBridgeHR Job Distribution Feed</title>
    <link>${baseUrl}</link>
    <description>Latest career opportunities published via HireBridgeHR</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
  },
};
