using System.Text.Json.Serialization;
using Google.Cloud.Firestore;

namespace Microsoft.CopilotDashboard.DataIngestion.Models
{
    [FirestoreData]
    public class Organization
    {
        /// <summary>
        /// Gets or sets the login name of the organization.
        /// </summary>
        [JsonPropertyName("login")]
        [FirestoreProperty("login")]
        public string Login { get; set; }

        /// <summary>
        /// Gets or sets the ID of the organization.
        /// </summary>
        [JsonPropertyName("id")]
        [FirestoreProperty("id")]
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the node ID of the organization.
        /// </summary>
        [JsonPropertyName("node_id")]
        [FirestoreProperty("node_id")]
        public string NodeId { get; set; }

        /// <summary>
        /// Gets or sets the URL of the organization.
        /// </summary>
        [JsonPropertyName("url")]
        [FirestoreProperty("url")]
        public string Url { get; set; }

        /// <summary>
        /// Gets or sets the repositories URL of the organization.
        /// </summary>
        [JsonPropertyName("repos_url")]
        [FirestoreProperty("repos_url")]
        public string ReposUrl { get; set; }

        /// <summary>
        /// Gets or sets the events URL of the organization.
        /// </summary>
        [JsonPropertyName("events_url")]
        [FirestoreProperty("events_url")]
        public string EventsUrl { get; set; }

        /// <summary>
        /// Gets or sets the hooks URL of the organization.
        /// </summary>
        [JsonPropertyName("hooks_url")]
        [FirestoreProperty("hooks_url")]
        public string HooksUrl { get; set; }

        /// <summary>
        /// Gets or sets the issues URL of the organization.
        /// </summary>
        [JsonPropertyName("issues_url")]
        [FirestoreProperty("issues_url")]
        public string IssuesUrl { get; set; }

        /// <summary>
        /// Gets or sets the members URL of the organization.
        /// </summary>
        [JsonPropertyName("members_url")]
        [FirestoreProperty("members_url")]
        public string MembersUrl { get; set; }

        /// <summary>
        /// Gets or sets the public members URL of the organization.
        /// </summary>
        [JsonPropertyName("public_members_url")]
        [FirestoreProperty("public_members_url")]
        public string PublicMembersUrl { get; set; }

        /// <summary>
        /// Gets or sets the avatar URL of the organization.
        /// </summary>
        [JsonPropertyName("avatar_url")]
        [FirestoreProperty("avatar_url")]
        public string AvatarUrl { get; set; }

        /// <summary>
        /// Gets or sets the description of the organization.
        /// </summary>
        [JsonPropertyName("description")]
        [FirestoreProperty("description")]
        public string Description { get; set; }
    }

    [FirestoreData]
    public class Team
    {
        /// <summary>
        /// Gets or sets the ID of the team.
        /// </summary>
        [JsonPropertyName("id")]
        [FirestoreProperty("id")]
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the node ID of the team.
        /// </summary>
        [JsonPropertyName("node_id")]
        [FirestoreProperty("node_id")]
        public string NodeId { get; set; }

        /// <summary>
        /// Gets or sets the URL of the team.
        /// </summary>
        [JsonPropertyName("url")]
        [FirestoreProperty("url")]
        public string Url { get; set; }

        /// <summary>
        /// Gets or sets the HTML URL of the team.
        /// </summary>
        [JsonPropertyName("html_url")]
        [FirestoreProperty("html_url")]
        public string HtmlUrl { get; set; }

        /// <summary>
        /// Gets or sets the name of the team.
        /// </summary>
        [JsonPropertyName("name")]
        [FirestoreProperty("name")]
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the slug of the team.
        /// </summary>
        [JsonPropertyName("slug")]
        [FirestoreProperty("slug")]
        public string Slug { get; set; }

        /// <summary>
        /// Gets or sets the description of the team.
        /// </summary>
        [JsonPropertyName("description")]
        [FirestoreProperty("description")]
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the privacy setting of the team.
        /// </summary>
        [JsonPropertyName("privacy")]
        [FirestoreProperty("privacy")]
        public string Privacy { get; set; }

        /// <summary>
        /// Gets or sets the notification setting of the team.
        /// </summary>
        [JsonPropertyName("notification_setting")]
        [FirestoreProperty("notification_setting")]
        public string NotificationSetting { get; set; }

        /// <summary>
        /// Gets or sets the permission level of the team.
        /// </summary>
        [JsonPropertyName("permission")]
        [FirestoreProperty("permission")]
        public string Permission { get; set; }

        /// <summary>
        /// Gets or sets the members URL of the team.
        /// </summary>
        [JsonPropertyName("members_url")]
        [FirestoreProperty("members_url")]
        public string MembersUrl { get; set; }

        /// <summary>
        /// Gets or sets the repositories URL of the team.
        /// </summary>
        [JsonPropertyName("repositories_url")]
        [FirestoreProperty("repositories_url")]
        public string RepositoriesUrl { get; set; }

        /// <summary>
        /// Gets or sets the parent team.
        /// </summary>
        [JsonPropertyName("parent")]
        [FirestoreProperty("parent")]
        public object Parent { get; set; }
    }
    [FirestoreData]
    public class User
    {
        /// <summary>
        /// Gets or sets the ID of the user.
        /// </summary>
        [JsonPropertyName("id")]
        [FirestoreProperty("id")]
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the login name of the user.
        /// </summary>
        [JsonPropertyName("login")]
        [FirestoreProperty("login")]
        public string Login { get; set; }

        /// <summary>
        /// Gets or sets the name of the user.
        /// </summary>
        [JsonPropertyName("name")]
        [FirestoreProperty("name")]
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the node ID of the user.
        /// </summary>
        [JsonPropertyName("node_id")]
        [FirestoreProperty("node_id")]
        public string NodeId { get; set; }

        /// <summary>
        /// Gets or sets the avatar URL of the user.
        /// </summary>
        [JsonPropertyName("avatar_url")]
        [FirestoreProperty("avatar_url")]
        public string AvatarUrl { get; set; }

        /// <summary>
        /// Gets or sets the gravatar ID of the user.
        /// </summary>
        [JsonPropertyName("gravatar_id")]
        [FirestoreProperty("gravatar_id")]
        public string GravatarId { get; set; }

        /// <summary>
        /// Gets or sets the URL of the user.
        /// </summary>
        [JsonPropertyName("url")]
        [FirestoreProperty("url")]
        public string Url { get; set; }

        /// <summary>
        /// Gets or sets the HTML URL of the user.
        /// </summary>
        [JsonPropertyName("html_url")]
        [FirestoreProperty("html_url")]
        public string HtmlUrl { get; set; }

        /// <summary>
        /// Gets or sets the followers URL of the user.
        /// </summary>
        [JsonPropertyName("followers_url")]
        [FirestoreProperty("followers_url")]
        public string FollowersUrl { get; set; }

        /// <summary>
        /// Gets or sets the following URL of the user.
        /// </summary>
        [JsonPropertyName("following_url")]
        [FirestoreProperty("following_url")]
        public string FollowingUrl { get; set; }

        /// <summary>
        /// Gets or sets the gists URL of the user.
        /// </summary>
        [JsonPropertyName("gists_url")]
        [FirestoreProperty("gists_url")]
        public string GistsUrl { get; set; }

        /// <summary>
        /// Gets or sets the starred URL of the user.
        /// </summary>
        [JsonPropertyName("starred_url")]
        [FirestoreProperty("starred_url")]
        public string StarredUrl { get; set; }

        /// <summary>
        /// Gets or sets the subscriptions URL of the user.
        /// </summary>
        [JsonPropertyName("subscriptions_url")]
        [FirestoreProperty("subscriptions_url")]
        public string SubscriptionsUrl { get; set; }

        /// <summary>
        /// Gets or sets the organizations URL of the user.
        /// </summary>
        [JsonPropertyName("organizations_url")]
        [FirestoreProperty("organizations_url")]
        public string OrganizationsUrl { get; set; }

        /// <summary>
        /// Gets or sets the repositories URL of the user.
        /// </summary>
        [JsonPropertyName("repos_url")]
        [FirestoreProperty("repos_url")]
        public string ReposUrl { get; set; }

        /// <summary>
        /// Gets or sets the events URL of the user.
        /// </summary>
        [JsonPropertyName("events_url")]
        [FirestoreProperty("events_url")]
        public string EventsUrl { get; set; }

        /// <summary>
        /// Gets or sets the received events URL of the user.
        /// </summary>
        [JsonPropertyName("received_events_url")]
        [FirestoreProperty("received_events_url")]
        public string ReceivedEventsUrl { get; set; }

        /// <summary>
        /// Gets or sets the type of the user.
        /// </summary>
        [JsonPropertyName("type")]
        [FirestoreProperty("type")]
        public string Type { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the user is a site admin.
        /// </summary>
        [JsonPropertyName("site_admin")]
        [FirestoreProperty("site_admin")]
        public bool SiteAdmin { get; set; }
    }
}