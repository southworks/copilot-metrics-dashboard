using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Http;
using Microsoft.CopilotDashboard.DataIngestion.Models;
using Microsoft.CopilotDashboard.DataIngestion.Services;
using Microsoft.Extensions.Logging;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions;

public class CopilotDataIngestion
{
    private readonly ILogger _logger;
    private readonly GitHubCopilotUsageClient usageClient;
    private readonly FirestoreDb _firestoreDb;
    private readonly JsonSerializerOptions jsonSerializerOptions = new()
    {
        WriteIndented = true // Optional: Makes the JSON output pretty-printed
    };

    public CopilotDataIngestion(
        ILoggerFactory loggerFactory,
        GitHubCopilotUsageClient usageClient,
        FirestoreDb firestoreDb)
    {
        _logger = loggerFactory.CreateLogger<CopilotDataIngestion>();
        this.usageClient = usageClient;
        _firestoreDb = firestoreDb;
    }

    public async Task HandleAsyc(HttpContext httpContext)
    {
        _logger.LogInformation($"GitHubCopilotDataIngestion timer trigger function executed at: {DateTime.Now}");

        List<CopilotUsage> usageHistory;

        var scope = Environment.GetEnvironmentVariable("GITHUB_API_SCOPE");
        if (!string.IsNullOrWhiteSpace(scope) && scope == "enterprise")
        {
            _logger.LogInformation("Fetching GitHub Copilot usage metrics for enterprise");
            usageHistory = await usageClient.GetCopilotMetricsForEnterpriseAsync();
        }
        else
        {
            _logger.LogInformation("Fetching GitHub Copilot usage metrics for organization");
            usageHistory = await usageClient.GetCopilotMetricsForOrgsAsync();
        }

        var batch = _firestoreDb.StartBatch();
        var collectionName = Environment.GetEnvironmentVariable("HISTORY_FIRESTORE_COLLECTION_NAME");
        var timestamp = Timestamp.FromDateTime(DateTime.UtcNow);

        foreach (var usage in usageHistory)
        {
            var jsonSerializedUsageObject = JsonSerializer.Serialize(usage);
            var docRef = _firestoreDb.Collection(collectionName).Document(usage.Id);
            batch.Set(docRef, new Dictionary<string, object>
            {
                { "timestamp", timestamp },
                { "data",  jsonSerializedUsageObject}
            });
        }
        await batch.CommitAsync();

        _logger.LogInformation("Successfully stored usage in Firestore");

        // Serialize metrics to JSON
        var metricsJson = JsonSerializer.Serialize(usageHistory, jsonSerializerOptions);

        // Return JSON response
        httpContext.Response.ContentType = "application/json";
        await httpContext.Response.WriteAsync(metricsJson);
    }
}