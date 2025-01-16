using System;
using System.Text.Json.Serialization;
using Google.Cloud.Firestore;

namespace Microsoft.CopilotDashboard.DataIngestion.Models;

[FirestoreData]
public class Metrics
{
    [JsonPropertyName("id")]
    [FirestoreProperty("id")]
    public string? Id { get; set; }

    [JsonPropertyName("date")]
    [FirestoreProperty("date")]
    public DateOnly Date { get; set; }

    [JsonPropertyName("team_data")]
    [FirestoreProperty("team_data")]
    public bool TeamData { get; set; }

    [JsonPropertyName("total_active_users")]
    [FirestoreProperty("total_active_users")]
    public int TotalActiveUsers { get; set; }

    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("copilot_ide_code_completions")]
    [FirestoreProperty("copilot_ide_code_completions")]
    public IdeCodeCompletions? CoPilotIdeCodeCompletions { get; set; }

    [JsonPropertyName("copilot_ide_chat")]
    [FirestoreProperty("copilot_ide_chat")]
    public IdeChat? IdeChat { get; set; }

    [JsonPropertyName("copilot_dotcom_chat")]
    [FirestoreProperty("copilot_dotcom_chat")]
    public DotComChat? DotComChat { get; set; }

    [JsonPropertyName("copilot_dotcom_pull_requests")]
    [FirestoreProperty("copilot_dotcom_pull_requests")]
    public DotComPullRequest? DotComPullRequests { get; set; }
}

[FirestoreData]
public class IdeCodeCompletions
{
    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("languages")]
    [FirestoreProperty("languages")]
    public IdeCodeCompletionLanguage[] Languages { get; set; }

    [JsonPropertyName("editors")]
    [FirestoreProperty("editors")]
    public IdeCodeCompletionEditor[] Editors { get; set; }
}

[FirestoreData]
public class IdeCodeCompletionLanguage
{
    [JsonPropertyName("name")]
    [FirestoreProperty("name")]
    public string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }
}

[FirestoreData]
public class IdeCodeCompletionEditor
{
    [JsonPropertyName("name")]
    [FirestoreProperty("name")]
    public string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    [FirestoreProperty("models")]
    public IdeCodeCompletionModel[] Models { get; set; }
}

[FirestoreData]
public class IdeCodeCompletionModel
{
    [JsonPropertyName("name")]
    [FirestoreProperty("name")]
    public string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    [FirestoreProperty("is_custom_model")]
    public bool IsCustomModel { get; set; }

    [JsonPropertyName("custom_model_training_date")]
    [FirestoreProperty("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }

    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("languages")]
    [FirestoreProperty("languages")]
    public IdeCodeCompletionModelLanguage[] Languages { get; set; }
}

[FirestoreData]
public class IdeCodeCompletionModelLanguage
{
    [JsonPropertyName("name")]
    [FirestoreProperty("name")]
    public string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_code_suggestions")]
    [FirestoreProperty("total_code_suggestions")]
    public int TotalCodeSuggestions { get; set; }

    [JsonPropertyName("total_code_acceptances")]
    [FirestoreProperty("total_code_acceptances")]
    public int TotalCodeAcceptances { get; set; }

    [JsonPropertyName("total_code_lines_suggested")]
    [FirestoreProperty("total_code_lines_suggested")]
    public int TotalCodeLinesSuggested { get; set; }

    [JsonPropertyName("total_code_lines_accepted")]
    [FirestoreProperty("total_code_lines_accepted")]
    public int TotalCodeLinesAccepted { get; set; }
}

[FirestoreData]
public class IdeChat
{
    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("editors")]
    [FirestoreProperty("editors")]
    public IdeChatEditor[] Editors { get; set; }
}

[FirestoreData]
public class IdeChatEditor
{
    [JsonPropertyName("name")]
    [FirestoreProperty("name")]
    public string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    [FirestoreProperty("models")]
    public IdeChatModel[] Models { get; set; }
}

[FirestoreData]
public class IdeChatModel
{
    [JsonPropertyName("name")]
    [FirestoreProperty("name")]
    public string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    [FirestoreProperty("is_custom_model")]
    public bool IsCustomModel { get; set; }

    [JsonPropertyName("custom_model_training_date")]
    [FirestoreProperty("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }

    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_chats")]
    [FirestoreProperty("total_chats")]
    public int TotalChats { get; set; }

    [JsonPropertyName("total_chat_insertion_events")]
    [FirestoreProperty("total_chat_insertion_events")]
    public int TotalChatInsertionEvents { get; set; }

    [JsonPropertyName("total_chat_copy_events")]
    [FirestoreProperty("total_chat_copy_events")]
    public int TotalChatCopyEvents { get; set; }
}

[FirestoreData]
public class DotComChat
{
    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    [FirestoreProperty("models")]
    public DotComChatModel[] Models { get; set; }
}

[FirestoreData]
public class DotComChatModel
{
    [JsonPropertyName("name")]
    [FirestoreProperty("name")]
    public string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    [FirestoreProperty("is_custom_model")]
    public bool IsCustomModel { get; set; }

    [JsonPropertyName("custom_model_training_date")]
    [FirestoreProperty("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }

    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_chats")]
    [FirestoreProperty("total_chats")]
    public int TotalChats { get; set; }
}

[FirestoreData]
public class DotComPullRequest
{
    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("repositories")]
    [FirestoreProperty("repositories")]
    public DotComPullRequestRepository[] Repositories { get; set; }
}

[FirestoreData]
public class DotComPullRequestRepository
{
    [JsonPropertyName("name")]
    [FirestoreProperty("name")]
    public string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    [FirestoreProperty("models")]
    public DotComPullRequestRepositoryModel[] Models { get; set; }
}

[FirestoreData]
public class DotComPullRequestRepositoryModel
{
    [JsonPropertyName("name")]
    [FirestoreProperty("name")]
    public string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    [FirestoreProperty("is_custom_model")]
    public bool IsCustomModel { get; set; }

    [JsonPropertyName("custom_model_training_date")]
    [FirestoreProperty("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }

    [JsonPropertyName("total_engaged_users")]
    [FirestoreProperty("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_pr_summaries_created")]
    [FirestoreProperty("total_pr_summaries_created")]
    public int TotalPrSummariesCreated { get; set; }
}
