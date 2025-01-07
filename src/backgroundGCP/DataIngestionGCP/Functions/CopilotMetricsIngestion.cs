using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.CopilotDashboard.DataIngestion.Models;
using Microsoft.CopilotDashboard.DataIngestion.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Google.Cloud.Functions.Framework;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Text.Json;
using Microsoft.CopilotDashboard.DataIngestion.Interfaces;
using System.Net.Http;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions;

public class CopilotMetricsIngestion : IHttpFunction
{
    private readonly ILogger _logger;
    private readonly IGitHubCopilotMetricsClient _metricsClient;
    private readonly IOptions<GithubMetricsApiOptions> _options;

    public CopilotMetricsIngestion(ILogger<CopilotMetricsIngestion> logger,
    IGitHubCopilotMetricsClient metricsClient,
    IOptions<GithubMetricsApiOptions> options)
    {
        _metricsClient = metricsClient;
        _logger = logger;
        _options = options;
    }

    public async Task HandleAsync(HttpContext context)
    {
        _logger.LogInformation($"GitHubCopilotMetricsIngestion timer trigger function executed at: {DateTime.Now}");
        bool.TryParse(Environment.GetEnvironmentVariable("USE_METRICS_API"), out var useMetricsApi);
        _logger.LogInformation($"USE_METRICS_API: {useMetricsApi}");
        if (!useMetricsApi)
        {
            await context.Response.WriteAsync("Metrics API not selected.");
            return;
        }

        var metrics = new List<Metrics>();

        metrics.AddRange(await ExtractMetrics());

        var teams = _options.Value.Teams;
        if (teams != null && teams.Length != 0)
        {
            foreach (var team in teams)
            {
                metrics.AddRange(await ExtractMetrics(team));
            }
        }
        else
        {
            metrics.AddRange(await ExtractMetrics());
        }

        _logger.LogInformation($"Metrics count: {metrics.Count}");

        // Serialize metrics to JSON
        var metricsJson = JsonSerializer.Serialize(metrics, new JsonSerializerOptions
        {
            WriteIndented = true // Optional: Makes the JSON output pretty-printed
        });

        // Return JSON response
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(metricsJson);
    }

    private async Task<Metrics[]> ExtractMetrics(string? team = null)
    {
        if (_options.Value.UseTestData)
        {
            return await LoadTestData(team);
        }

        var scope = Environment.GetEnvironmentVariable("GITHUB_API_SCOPE");
        if (!string.IsNullOrWhiteSpace(scope) && scope == "enterprise")
        {
            _logger.LogInformation("Fetching GitHub Copilot usage metrics for enterprise");
            return await _metricsClient.GetCopilotMetricsForEnterpriseAsync(team);
        }

        _logger.LogInformation("Fetching GitHub Copilot usage metrics for organization");
        return await _metricsClient.GetCopilotMetricsForOrganizationAsync(team);
    }

    private ValueTask<Metrics[]> LoadTestData(string? teamName)
    {
        return _metricsClient.GetTestCoPilotMetrics(teamName);
    }
}
