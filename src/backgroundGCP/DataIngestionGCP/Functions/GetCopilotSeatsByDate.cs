using System;
using System.Linq;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Google.Cloud.Functions.Framework;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions;

public class GetCopilotSeatsByDate : IHttpFunction
{
    private readonly ILogger<GetCopilotSeatsByDate> _logger;
    private readonly FirestoreDb _firestoreDb;

    public GetCopilotSeatsByDate(
    ILogger<GetCopilotSeatsByDate> logger,
    FirestoreDb firestoreDb)
    {
        _logger = logger;
        _firestoreDb = firestoreDb;
    }

    public async Task HandleAsync(HttpContext context)
    {
        try
        {
            string apiKey = context.Request.Query["apiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync("Missing 'apiKey' parameter.");
                return;
            }

            if (apiKey != Environment.GetEnvironmentVariable("API_KEY"))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Invalid API key.");
                return;
            }

            string fromDateStr = context.Request.Query["from"];
            string toDateStr = context.Request.Query["to"];

            DateTime? fromDate = null;
            DateTime? toDate = null;

            if (!string.IsNullOrEmpty(fromDateStr))
            {
                if (!DateTime.TryParse(fromDateStr, out DateTime parsedFromDate))
                {
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsync("Invalid 'from' date.");
                    return;
                }
                fromDate = parsedFromDate;
            }

            if (!string.IsNullOrEmpty(toDateStr))
            {
                if (!DateTime.TryParse(toDateStr, out DateTime parsedToDate))
                {
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsync("Invalid 'to' date.");
                    return;
                }
                toDate = parsedToDate;
            }

            CollectionReference collection = _firestoreDb.Collection(Environment.GetEnvironmentVariable("SEATS_HISTORY_FIRESTORE_COLLECTION_NAME"));
            Query query = collection;

            if (fromDate.HasValue)
            {
                query = query.WhereGreaterThanOrEqualTo("Date", fromDate.Value.ToUniversalTime());
            }

            if (toDate.HasValue)
            {
                query = query.WhereLessThanOrEqualTo("Date", toDate.Value.ToUniversalTime());
            }

            QuerySnapshot snapshot = await query.GetSnapshotAsync();
            var seatsHistory = snapshot.Documents.Select(doc => doc.ToDictionary()).ToList();

            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(seatsHistory);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving documents from Firestore.");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync("Internal Server Error");
        }
    }
}
