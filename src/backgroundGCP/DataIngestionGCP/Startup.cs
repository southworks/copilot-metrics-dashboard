using Microsoft.Extensions.DependencyInjection;
using Microsoft.CopilotDashboard.DataIngestion.Services;
using System.Net.Http;
using System;
using System.Net.Http.Headers;
using Google.Cloud.Functions.Hosting;
using Microsoft.AspNetCore.Hosting;
using Microsoft.CopilotDashboard.DataIngestion.Interfaces;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;

[assembly: FunctionsStartup(typeof(Microsoft.CopilotDashboard.DataIngestion.Startup))]

namespace Microsoft.CopilotDashboard.DataIngestion
{
    public class Startup : FunctionsStartup
    {
        public override void ConfigureServices(WebHostBuilderContext context, IServiceCollection services)
        {
            Console.WriteLine("Configuring services");

            LoadEnvironmentVariables();

            var builder = new FirestoreDbBuilder
            {
                ProjectId = Environment.GetEnvironmentVariable("PROJECT_ID"),
                DatabaseId = Environment.GetEnvironmentVariable("DATABASE_ID")
            };

            FirestoreDb firestoreDb = builder.Build();

            // Register HttpClient and configure options
            var metricsSection = Environment.GetEnvironmentVariable("GITHUB_METRICS_TEAMS");
            if (metricsSection != null)
            {
                services.Configure<GithubMetricsApiOptions>(options =>
                {
                    options.Teams = JsonSerializer.Deserialize<List<string>>(metricsSection)?.ToArray();
                });
            }

            // Register custom services
            services.AddHttpClient();
            services.AddHttpClient<GitHubCopilotMetricsClient>(ConfigureClient);
            services.AddHttpClient<GitHubCopilotUsageClient>(ConfigureClient);
            services.AddHttpClient<GitHubCopilotApiService>(ConfigureClient);
            services.AddScoped<IGitHubCopilotMetricsClient, GitHubCopilotMetricsClient>();
            services.AddSingleton(firestoreDb);
        }

        private static void ConfigureClient(HttpClient httpClient)
        {
            var apiVersion = Environment.GetEnvironmentVariable("GITHUB_API_VERSION");
            var token = Environment.GetEnvironmentVariable("GITHUB_TOKEN");
            var gitHubApiBaseUrl = "https://api.github.com/";

            httpClient.BaseAddress = new Uri(gitHubApiBaseUrl);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            httpClient.DefaultRequestHeaders.Add("X-GitHub-Api-Version", apiVersion);
            httpClient.DefaultRequestHeaders.Add("User-Agent", "GitHubCopilotDataIngestion");
        }

        private void LoadEnvironmentVariables()
        {
            var useLocalSettings = Environment.GetEnvironmentVariable("USE_LOCAL_SETTINGS");

            if (useLocalSettings == null || !useLocalSettings.Equals("true", StringComparison.OrdinalIgnoreCase))
            {
                var config = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("local.settings.json", optional: false, reloadOnChange: true)
                    .Build();

                var envVariables = config.GetSection("Values").GetChildren();
                foreach (var envVariable in envVariables)
                {
                    Environment.SetEnvironmentVariable(envVariable.Key, envVariable.Value);
                }
            }
        }
    }
}
