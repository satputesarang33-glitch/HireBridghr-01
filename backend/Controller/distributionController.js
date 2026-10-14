import { JobModel } from "../Model/Job.js";
import { distributionFeedService } from "../Services/distributionFeedService.js";

export const distributionController = {
  /**
   * Return Indeed XML Job Feed
   */
  async getIndeedXml(req, res, next) {
    try {
      const jobs = await JobModel.getAll();
      const baseUrl = `${req.protocol}://${req.get("host")}`.replace(":5000", ":3000");
      const xml = distributionFeedService.generateIndeedXml(jobs, baseUrl);

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      return res.status(200).send(xml);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Return Standard RSS 2.0 Job Feed
   */
  async getRssFeed(req, res, next) {
    try {
      const jobs = await JobModel.getAll();
      const baseUrl = `${req.protocol}://${req.get("host")}`.replace(":5000", ":3000");
      const rss = distributionFeedService.generateRssFeed(jobs, baseUrl);

      res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
      return res.status(200).send(rss);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Distribute job to external boards (LinkedIn, Indeed, ZipRecruiter, Glassdoor)
   */
  async distributeJob(req, res, next) {
    try {
      const { id } = req.params;
      const { platforms = ["LINKEDIN", "INDEED", "GLASSDOOR", "ZIPRECRUITER"] } = req.body;

      const job = await JobModel.getByIdOrSlug(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: { message: "Job requisition not found." },
        });
      }

      const currentDistribution = job.distribution || [];
      const updatedDistribution = platforms.map((platform) => ({
        platform,
        status: "PUBLISHED",
        distributedAt: new Date().toISOString(),
        boardUrl: `https://${platform.toLowerCase()}.com/jobs/view/${job.id}`,
      }));

      await JobModel.update(job.id, {
        distribution: updatedDistribution,
        lastDistributedAt: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        data: {
          jobId: job.id,
          jobTitle: job.title,
          distribution: updatedDistribution,
        },
        message: `Job successfully syndicated to ${platforms.length} external career boards.`,
      });
    } catch (err) {
      next(err);
    }
  },
};
