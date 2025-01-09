using System.Collections.Generic;
using System.Text.Json.Serialization;
using Google.Cloud.Firestore;

namespace Microsoft.CopilotDashboard.DataIngestion.Models;

[FirestoreData]
public class CopilotUsage
{
    [JsonPropertyName("total_suggestions_count")]
    [FirestoreProperty("total_suggestions_count")]
    public required int TotalSuggestionsCount { get; set; }

    [JsonPropertyName("total_acceptances_count")]
    [FirestoreProperty("total_acceptances_count")]
    public required int TotalAcceptancesCount { get; set; }

    [JsonPropertyName("total_lines_suggested")]
    [FirestoreProperty("total_lines_suggested")]
    public required int TotalLinesSuggested { get; set; }

    [JsonPropertyName("total_lines_accepted")]
    [FirestoreProperty("total_lines_accepted")]
    public required int TotalLinesAccepted { get; set; }

    [JsonPropertyName("total_active_users")]
    [FirestoreProperty("total_active_users")]
    public required int TotalActiveUsers { get; set; }

    [JsonPropertyName("total_chat_acceptances")]
    [FirestoreProperty("total_chat_acceptances")]
    public required int TotalChatAcceptances { get; set; }

    [JsonPropertyName("total_chat_turns")]
    [FirestoreProperty("total_chat_turns")]
    public required int TotalChatTurns { get; set; }

    [JsonPropertyName("total_active_chat_users")]
    [FirestoreProperty("total_active_chat_users")]
    public required int TotalActiveChatUsers { get; set; }

    [JsonPropertyName("day")]
    [FirestoreProperty("day")]
    public required string Day { get; set; }

    [JsonPropertyName("id")]
    [FirestoreProperty("id")]
    public string Id
    {
        get
        {
            return $"{Day}";
        }
    }

    [JsonPropertyName("breakdown")]
    [FirestoreProperty("breakdown")]
    public required List<Breakdown> Breakdown { get; set; }
}


[FirestoreData]
public class Breakdown
{
    [JsonPropertyName("language")]
    [FirestoreProperty("language")]
    public required string Language { get; set; }

    [JsonPropertyName("editor")]
    [FirestoreProperty("editor")]
    public required string Editor { get; set; }

    [JsonPropertyName("suggestions_count")]
    [FirestoreProperty("suggestions_count")]
    public required int SuggestionsCount { get; set; }

    [JsonPropertyName("acceptances_count")]
    [FirestoreProperty("acceptances_count")]
    public required int AcceptancesCount { get; set; }

    [JsonPropertyName("lines_suggested")]
    [FirestoreProperty("lines_suggested")]
    public required int LinesSuggested { get; set; }

    [JsonPropertyName("lines_accepted")]
    [FirestoreProperty("lines_accepted")]
    public required int LinesAccepted { get; set; }

    [JsonPropertyName("active_users")]
    [FirestoreProperty("active_users")]
    public required int ActiveUsers { get; set; }
}
