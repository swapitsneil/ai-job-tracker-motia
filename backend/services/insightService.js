const Database = require('better-sqlite3');
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '../db/applications.db');
const db = new Database(dbPath);

class InsightService {
  /**
   * Calculate rejection rate by source
   * @returns {Object} Insights about rejection rates by source
   */
  getRejectionRateBySource() {
    try {
      // Get all applications grouped by source and status
      const stmt = db.prepare(`
        SELECT
          source,
          status,
          COUNT(*) as count
        FROM applications
        GROUP BY source, status
        ORDER BY source, status
      `);

      const results = stmt.all();

      // Organize data by source
      const sourceData = {};
      results.forEach(row => {
        if (!sourceData[row.source]) {
          sourceData[row.source] = {
            total: 0,
            rejected: 0,
            applied: 0,
            interview: 0,
            offer: 0
          };
        }
        sourceData[row.source].total += row.count;
        sourceData[row.source][row.status.toLowerCase()] = row.count;
      });

      // Generate insights
      const insights = [];

      for (const [source, data] of Object.entries(sourceData)) {
        const rejectionRate = data.total > 0
          ? Math.round((data.rejected / data.total) * 100)
          : 0;

        insights.push({
          source,
          totalApplications: data.total,
          rejectionRate,
          rejectionCount: data.rejected,
          successRate: 100 - rejectionRate
        });
      }

      // Find source with highest rejection rate
      const highestRejection = insights.reduce((max, insight) =>
        insight.rejectionRate > max.rejectionRate ? insight : max,
        { rejectionRate: 0 }
      );

      // Find source with lowest rejection rate (best performing)
      const lowestRejection = insights.reduce((min, insight) =>
        insight.rejectionRate < min.rejectionRate ? insight : min,
        { rejectionRate: 100 }
      );

      return {
        success: true,
        insights: insights.map(insight => ({
          source: insight.source,
          totalApplications: insight.totalApplications,
          rejectionRate: `${insight.rejectionRate}%`,
          rejectionCount: insight.rejectionCount,
          successRate: `${insight.successRate}%`
        })),
        summary: this._generateRejectionRateSummary(insights, highestRejection, lowestRejection)
      };
    } catch (error) {
      console.error('Error calculating rejection rate by source:', error);
      throw error;
    }
  }

  /**
   * Generate plain English summary for rejection rates
   */
  _generateRejectionRateSummary(insights, highestRejection, lowestRejection) {
    const summary = [];

    summary.push(`📊 **Rejection Rate Analysis** (Based on ${insights.reduce((sum, i) => sum + i.totalApplications, 0)} total applications)`);

    if (insights.length === 0) {
      summary.push("No application data available for analysis.");
      return summary.join('\n');
    }

    summary.push(`\n🎯 **Best Performing Source**: ${lowestRejection.source} with only ${lowestRejection.rejectionRate}% rejection rate`);
    summary.push(`🚨 **Highest Rejection Source**: ${highestRejection.source} with ${highestRejection.rejectionRate}% rejection rate`);

    if (highestRejection.rejectionRate > 50) {
      summary.push(`\n⚠️ **Recommendation**: Consider improving your approach for ${highestRejection.source} applications.`);
    }

    if (lowestRejection.successRate > 70) {
      summary.push(`✅ **Success Pattern**: Your strategy for ${lowestRejection.source} is working well - keep it up!`);
    }

    summary.push('\n📋 **Detailed Breakdown**:');
    insights.forEach(insight => {
      summary.push(`- ${insight.source}: ${insight.rejectionRate} rejection rate (${insight.rejectionCount} rejections out of ${insight.totalApplications} applications)`);
    });

    return summary.join('\n');
  }

  /**
   * Find best performing resume version
   * @returns {Object} Insights about resume version performance
   */
  getBestPerformingResumeVersion() {
    try {
      // Get all applications grouped by resume version and status
      const stmt = db.prepare(`
        SELECT
          resume_version,
          status,
          COUNT(*) as count
        FROM applications
        GROUP BY resume_version, status
        ORDER BY resume_version, status
      `);

      const results = stmt.all();

      // Organize data by resume version
      const versionData = {};
      results.forEach(row => {
        if (!versionData[row.resume_version]) {
          versionData[row.resume_version] = {
            total: 0,
            rejected: 0,
            interview: 0,
            offer: 0,
            applied: 0
          };
        }
        versionData[row.resume_version].total += row.count;
        versionData[row.resume_version][row.status.toLowerCase()] = row.count;
      });

      // Calculate performance metrics for each version
      const versionInsights = [];

      for (const [version, data] of Object.entries(versionData)) {
        const rejectionRate = data.total > 0
          ? Math.round((data.rejected / data.total) * 100)
          : 0;

        const successRate = data.total > 0
          ? Math.round(((data.interview + data.offer) / data.total) * 100)
          : 0;

        versionInsights.push({
          version,
          totalApplications: data.total,
          rejectionRate,
          successRate,
          interviewRate: data.total > 0 ? Math.round((data.interview / data.total) * 100) : 0,
          offerRate: data.total > 0 ? Math.round((data.offer / data.total) * 100) : 0
        });
      }

      // Find best and worst performing versions
      const bestVersion = versionInsights.reduce((best, version) =>
        version.successRate > best.successRate ? version : best,
        { successRate: 0 }
      );

      const worstVersion = versionInsights.reduce((worst, version) =>
        version.successRate < worst.successRate ? version : worst,
        { successRate: 100 }
      );

      return {
        success: true,
        versions: versionInsights,
        summary: this._generateResumeVersionSummary(versionInsights, bestVersion, worstVersion)
      };
    } catch (error) {
      console.error('Error calculating best performing resume version:', error);
      throw error;
    }
  }

  /**
   * Generate plain English summary for resume versions
   */
  _generateResumeVersionSummary(versionInsights, bestVersion, worstVersion) {
    const summary = [];

    summary.push(`📄 **Resume Version Performance Analysis**`);

    if (versionInsights.length === 0) {
      summary.push("No resume version data available for analysis.");
      return summary.join('\n');
    }

    summary.push(`\n🏆 **Best Performing Version**: Resume ${bestVersion.version}`);
    summary.push(`   - Success Rate: ${bestVersion.successRate}%`);
    summary.push(`   - Interview Rate: ${bestVersion.interviewRate}%`);
    summary.push(`   - Offer Rate: ${bestVersion.offerRate}%`);
    summary.push(`   - Total Applications: ${bestVersion.totalApplications}`);

    summary.push(`\n👎 **Lowest Performing Version**: Resume ${worstVersion.version}`);
    summary.push(`   - Success Rate: ${worstVersion.successRate}%`);
    summary.push(`   - Interview Rate: ${worstVersion.interviewRate}%`);
    summary.push(`   - Offer Rate: ${worstVersion.offerRate}%`);
    summary.push(`   - Total Applications: ${worstVersion.totalApplications}`);

    if (bestVersion.successRate > worstVersion.successRate + 20) {
      summary.push(`\n💡 **Recommendation**: Consider using Resume ${bestVersion.version} as your primary template.`);
    }

    if (worstVersion.rejectionRate > 60) {
      summary.push(`⚠️ **Warning**: Resume ${worstVersion.version} has a high rejection rate - consider revising it.`);
    }

    summary.push('\n📊 **All Resume Versions**:');
    versionInsights.forEach(version => {
      summary.push(`- Resume ${version.version}: ${version.successRate}% success rate (${version.interviewRate}% interviews, ${version.offerRate}% offers)`);
    });

    return summary.join('\n');
  }

  /**
   * Calculate average response time for different status transitions
   * @returns {Object} Insights about response times
   */
  getAverageResponseTime() {
    try {
      const currentDate = new Date();

      // Get all applications with their dates
      const stmt = db.prepare(`
        SELECT
          id,
          company,
          role,
          status,
          applied_at,
          (julianday('now') - julianday(applied_at)) as days_since_applied
        FROM applications
        WHERE status IN ('Interview', 'Offer', 'Rejected')
        ORDER BY applied_at
      `);

      const applications = stmt.all();

      if (applications.length === 0) {
        return {
          success: true,
          summary: "📊 **Response Time Analysis**: No completed applications (Interview/Offer/Rejected) found in the database."
        };
      }

      // Group by status and calculate averages
      const statusGroups = {
        Interview: [],
        Offer: [],
        Rejected: []
      };

      applications.forEach(app => {
        if (statusGroups[app.status]) {
          statusGroups[app.status].push(app.days_since_applied);
        }
      });

      // Calculate averages
      const averages = {};
      for (const [status, days] of Object.entries(statusGroups)) {
        if (days.length > 0) {
          const avg = days.reduce((sum, day) => sum + day, 0) / days.length;
          averages[status] = Math.round(avg);
        }
      }

      // Find fastest and slowest responses
      const statusesWithAverages = Object.entries(averages);
      const fastestResponse = statusesWithAverages.reduce((fastest, [status, avg]) =>
        avg < fastest.avg ? { status, avg } : fastest,
        { status: '', avg: Infinity }
      );

      const slowestResponse = statusesWithAverages.reduce((slowest, [status, avg]) =>
        avg > slowest.avg ? { status, avg } : slowest,
        { status: '', avg: 0 }
      );

      return {
        success: true,
        averages,
        summary: this._generateResponseTimeSummary(averages, fastestResponse, slowestResponse, applications)
      };
    } catch (error) {
      console.error('Error calculating average response time:', error);
      throw error;
    }
  }

  /**
   * Generate plain English summary for response times
   */
  _generateResponseTimeSummary(averages, fastestResponse, slowestResponse, applications) {
    const summary = [];

    summary.push(`⏱️ **Response Time Analysis** (Based on ${applications.length} completed applications)`);

    if (Object.keys(averages).length === 0) {
      summary.push("No response time data available for analysis.");
      return summary.join('\n');
    }

    summary.push(`\n🏃 **Fastest Response**: ${fastestResponse.status} in ${fastestResponse.avg} days on average`);
    summary.push(`🐢 **Slowest Response**: ${slowestResponse.status} in ${slowestResponse.avg} days on average`);

    summary.push('\n📊 **Average Response Times**:');
    if (averages.Interview) {
      summary.push(`- Interview: ${averages.Interview} days from application`);
    }
    if (averages.Offer) {
      summary.push(`- Offer: ${averages.Offer} days from application`);
    }
    if (averages.Rejected) {
      summary.push(`- Rejection: ${averages.Rejected} days from application`);
    }

    // Provide insights based on response times
    if (averages.Interview && averages.Interview < 7) {
      summary.push(`\n✅ **Positive Insight**: Getting interviews quickly (under 7 days) suggests your applications are strong.`);
    }

    if (averages.Offer && averages.Offer < 14) {
      summary.push(`✅ **Excellent Performance**: Receiving offers in under 2 weeks is very competitive.`);
    }

    if (averages.Rejected && averages.Rejected < 5) {
      summary.push(`\n⚠️ **Quick Rejections**: Being rejected in under 5 days might indicate your applications aren't getting proper consideration.`);
    }

    if (averages.Interview && averages.Interview > 21) {
      summary.push(`\n💡 **Recommendation**: Consider following up on applications if you don't hear back within 2-3 weeks.`);
    }

    return summary.join('\n');
  }

  /**
   * Get comprehensive insights combining all analyses
   * @returns {Object} Complete insights report
   */
  getComprehensiveInsights() {
    try {
      const rejectionInsights = this.getRejectionRateBySource();
      const resumeInsights = this.getBestPerformingResumeVersion();
      const responseTimeInsights = this.getAverageResponseTime();

      const comprehensiveSummary = [];

      comprehensiveSummary.push('📊 **COMPREHENSIVE JOB APPLICATION INSIGHTS**');
      comprehensiveSummary.push('============================================\n');

      comprehensiveSummary.push('🔍 **Key Findings**:\n');

      // Add rejection rate insights
      if (rejectionInsights.insights && rejectionInsights.insights.length > 0) {
        const bestSource = rejectionInsights.insights.reduce((best, insight) =>
          insight.successRate > best.successRate ? insight : best,
          { successRate: '0%' }
        );
        comprehensiveSummary.push(`✅ Your best application source is ${bestSource.source} with ${bestSource.successRate} success rate.`);
      }

      // Add resume insights
      if (resumeInsights.versions && resumeInsights.versions.length > 0) {
        const bestResume = resumeInsights.versions.reduce((best, version) =>
          version.successRate > best.successRate ? version : best,
          { successRate: 0 }
        );
        comprehensiveSummary.push(`📄 Your best performing resume is version ${bestResume.version} with ${bestResume.successRate}% success rate.`);
      }

      // Add response time insights
      if (responseTimeInsights.averages && Object.keys(responseTimeInsights.averages).length > 0) {
        const avgResponse = responseTimeInsights.averages;
        if (avgResponse.Interview) {
          comprehensiveSummary.push(`⏱️ Average time to interview: ${avgResponse.Interview} days`);
        }
        if (avgResponse.Offer) {
          comprehensiveSummary.push(`💼 Average time to offer: ${avgResponse.Offer} days`);
        }
      }

      comprehensiveSummary.push('\n💡 **Recommendations**:\n');

      // Generate recommendations based on data
      if (rejectionInsights.insights && rejectionInsights.insights.some(i => parseInt(i.rejectionRate) > 50)) {
        comprehensiveSummary.push('🚨 Consider improving your application strategy for sources with high rejection rates.');
      }

      if (resumeInsights.versions && resumeInsights.versions.some(v => v.successRate < 30)) {
        comprehensiveSummary.push('📝 Review and update low-performing resume versions.');
      }

      if (responseTimeInsights.averages && responseTimeInsights.averages.Interview > 14) {
        comprehensiveSummary.push('⏰ Follow up on applications after 2 weeks if you haven\'t heard back.');
      }

      comprehensiveSummary.push('\n📈 **Detailed Analysis**:');
      comprehensiveSummary.push('\n' + rejectionInsights.summary);
      comprehensiveSummary.push('\n' + resumeInsights.summary);
      comprehensiveSummary.push('\n' + responseTimeInsights.summary);

      return {
        success: true,
        comprehensiveSummary: comprehensiveSummary.join('\n'),
        detailedInsights: {
          rejectionRate: rejectionInsights,
          resumePerformance: resumeInsights,
          responseTime: responseTimeInsights
        }
      };
    } catch (error) {
      console.error('Error generating comprehensive insights:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new InsightService();