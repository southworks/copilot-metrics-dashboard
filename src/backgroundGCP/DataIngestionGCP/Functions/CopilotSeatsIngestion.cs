﻿using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Http;
using Microsoft.CopilotDashboard.DataIngestion.Models;
using Microsoft.CopilotDashboard.DataIngestion.Services;
using Microsoft.Extensions.Logging;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions;

public class CopilotSeatsIngestion
{
    private readonly ILogger _logger;
    private readonly GitHubCopilotApiService _gitHubCopilotApiService;
    private readonly FirestoreDb _firestoreDb;
    private readonly JsonSerializerOptions jsonSerializerOptions = new()
    {
        WriteIndented = true // Optional: Makes the JSON output pretty-printed
    };

    public CopilotSeatsIngestion(
        GitHubCopilotApiService gitHubCopilotApiService,
        ILogger<CopilotSeatsIngestion> logger,
        FirestoreDb firestoreDb)
    {
        _gitHubCopilotApiService = gitHubCopilotApiService;
        _logger = logger;
        _firestoreDb = firestoreDb;
    }

    public async Task HandleAsync(HttpContext httpContext)
    {
        _logger.LogInformation($"GitHubCopilotSeatsIngestion timer trigger function executed at: {DateTime.Now}");

        CopilotAssignedSeats seats;

        var token = Environment.GetEnvironmentVariable("GITHUB_TOKEN")!;
        var scope = Environment.GetEnvironmentVariable("GITHUB_API_SCOPE")!;
        Boolean.TryParse(Environment.GetEnvironmentVariable("ENABLE_SEATS_INGESTION") ?? "true", out var seatsIngestionEnabled);
        if (!seatsIngestionEnabled)
        {
            _logger.LogInformation("Seats ingestion is disabled");
            return;
        }
        if (!string.IsNullOrWhiteSpace(scope) && scope == "enterprise")
        {
            var enterprise = Environment.GetEnvironmentVariable("GITHUB_ENTERPRISE")!;
            _logger.LogInformation("Fetching GitHub Copilot seats for enterprise");
            seats = await _gitHubCopilotApiService.GetEnterpriseAssignedSeatsAsync(enterprise, token);
        }
        else
        {
            var organization = Environment.GetEnvironmentVariable("GITHUB_ORGANIZATION")!;
            _logger.LogInformation("Fetching GitHub Copilot seats for organization");
            seats = await _gitHubCopilotApiService.GetOrganizationAssignedSeatsAsync(organization, token);
        }

        // Store seats data in Firestore
        var batch = _firestoreDb.StartBatch();
        var collectionName = Environment.GetEnvironmentVariable("SEATS_HISTORY_FIRESTORE_COLLECTION_NAME");
        var timestamp = Timestamp.FromDateTime(DateTime.UtcNow);

        var jsonSerializedSeatsObject = JsonSerializer.Serialize(seats);
        var docRef = _firestoreDb.Collection(collectionName).Document(seats.Id);
        batch.Set(docRef, new Dictionary<string, object>
        {
            { "timestamp", timestamp },
            { "data",  jsonSerializedSeatsObject}
        });

        await batch.CommitAsync();

        _logger.LogInformation("Successfully stored seats in Firestore");

        // Serialize metrics to JSON
        var seatsJson = JsonSerializer.Serialize(seats, jsonSerializerOptions);

        // Return JSON response
        httpContext.Response.ContentType = "application/json";
        await httpContext.Response.WriteAsync(seatsJson);
    }
}